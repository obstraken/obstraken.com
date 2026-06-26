import type { Metadata } from "next";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://obstraken.com").replace(/\/$/, "");

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Obstraken",
  url: siteUrl,
  logo: `${siteUrl}/favicon.svg`,
  email: "team@obstraken.com",
  telephone: "+33 6 07 22 49 26",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Paris",
    addressCountry: "FR",
  },
  sameAs: [],
};

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function pageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const canonical = `${siteUrl}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Obstraken",
      locale: "fr_FR",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
