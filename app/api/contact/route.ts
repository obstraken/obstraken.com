import { google } from "googleapis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ContactPayload = {
  nom?: unknown;
  email?: unknown;
  societe?: unknown;
  tel?: unknown;
  message?: unknown;
  website?: unknown;
};

const defaultRecipients = ["mcleuziou@obstraken.com", "c.cabrera@obstraken.com"];
const gmailScope = "https://www.googleapis.com/auth/gmail.send";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function encodeHeader(value: string) {
  return `=?UTF-8?B?${Buffer.from(cleanHeader(value), "utf8").toString("base64")}?=`;
}

function base64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function parseRecipients(value: string | undefined) {
  if (!value) {
    return defaultRecipients;
  }

  const recipients = value
    .split(",")
    .map((email) => cleanHeader(email))
    .filter(Boolean);

  return recipients.length ? recipients : defaultRecipients;
}

function getPrivateKey() {
  return process.env.GMAIL_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function buildPlainTextEmail(input: {
  from: string;
  recipients: string[];
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}) {
  const subjectTarget = input.company || input.name;
  const subject = `Demande de diagnostic data - ${subjectTarget}`;
  const replyToName = input.name ? `${encodeHeader(input.name)} <${cleanHeader(input.email)}>` : cleanHeader(input.email);

  const body = [
    "Nouvelle demande depuis le formulaire obstraken.com",
    "",
    `Nom: ${input.name}`,
    `Email: ${input.email}`,
    `Société: ${input.company || "-"}`,
    `Téléphone: ${input.phone || "-"}`,
    "",
    "Message:",
    input.message,
  ].join("\r\n");

  return [
    `From: Obstraken <${cleanHeader(input.from)}>`,
    `To: ${input.recipients.map(cleanHeader).join(", ")}`,
    `Reply-To: ${replyToName}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    body,
  ].join("\r\n");
}

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (asString(payload.website)) {
    return NextResponse.json({ ok: true });
  }

  const name = asString(payload.nom);
  const email = asString(payload.email);
  const company = asString(payload.societe);
  const phone = asString(payload.tel);
  const message = asString(payload.message);

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Nom, email et message sont obligatoires." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  const serviceAccountEmail = process.env.GMAIL_SERVICE_ACCOUNT_EMAIL;
  const privateKey = getPrivateKey();
  const delegatedUser = process.env.GMAIL_DELEGATED_USER ?? "team@obstraken.com";
  const from = process.env.CONTACT_EMAIL_FROM ?? delegatedUser;
  const recipients = parseRecipients(process.env.CONTACT_EMAIL_TO);

  if (!serviceAccountEmail || !privateKey || !delegatedUser) {
    return NextResponse.json({ error: "Configuration email incomplète." }, { status: 500 });
  }

  try {
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: [gmailScope],
      subject: delegatedUser,
    });
    const gmail = google.gmail({ version: "v1", auth });
    const raw = base64Url(
      buildPlainTextEmail({
        from,
        recipients,
        name,
        email,
        company,
        phone,
        message,
      }),
    );

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Gmail contact send failed", error);
    return NextResponse.json(
      { error: "Impossible d'envoyer la demande pour le moment." },
      { status: 502 },
    );
  }
}
