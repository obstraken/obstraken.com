# obstraken.com - site vitrine

Site vitrine Obstraken migré sur Next.js App Router, TypeScript, Tailwind CSS et pnpm.

## Démarrer en local

```bash
corepack enable
corepack prepare pnpm@11.9.0 --activate
pnpm install
pnpm dev
```

Le site est ensuite disponible sur `http://localhost:3000`.

## Variables d'environnement

Copier `.env.example` vers `.env.local`, puis renseigner les valeurs Gmail :

```bash
NEXT_PUBLIC_SITE_URL=https://obstraken.com
GMAIL_SERVICE_ACCOUNT_EMAIL=service-account-name@project-id.iam.gserviceaccount.com
GMAIL_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GMAIL_DELEGATED_USER=team@obstraken.com
CONTACT_EMAIL_FROM=team@obstraken.com
CONTACT_EMAIL_TO=mcleuziou@obstraken.com,c.cabrera@obstraken.com
```

L'envoi du formulaire passe par `app/api/contact/route.ts` et l'API Gmail `users.messages.send`.

## Commandes utiles

```bash
pnpm lint
pnpm build
pnpm start
```
