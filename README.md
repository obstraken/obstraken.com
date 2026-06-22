# obstraken.com - site vitrine

Site vitrine d'**Obstraken - L'Usine de Données Souveraine as-a-Service**.
HTML / CSS / JS pur, sans build, prêt à déployer.

## Démarrer en local

Aucune dépendance. Ouvrez simplement `index.html`, ou servez le dossier :

```bash
python3 -m http.server 8080
# puis ouvrez http://localhost:8080
```

Le fichier `index.html` contient la version retenue du site.

## Structure

```
index.html                 page principale
favicon.svg                favicon (motif « nexus K », dégradé de la marque)
mentions-legales.html      mentions légales
politique-confidentialite.html
assets/                    logos + portraits de l'équipe (fournis)
assets/partners/           logos partenaires et technos (S3NS, Google Cloud, Azure, Qlik)
```

## Contenu

Le contenu reprend le document *OBSTRAKEN NEXUS — L'Usine de Données Souveraine* et les
textes du site existant (à partir de la section « usine souveraine de données ») :
freins et leviers, offre Nexus Start/Build/Run, les 9 expertises, l'équipe, les références
(LPCR, EMEIS, IQVIA), les technos cloud/BI et un formulaire de contact.

## Formulaire de contact

Site statique : à la soumission, le formulaire ouvre le client mail de l'utilisateur
(pré-rempli vers `mcleuziou@obstraken.com`). Pour un envoi côté serveur, brancher le
`<form>` sur un service (Formspree, Netlify Forms, une API…).
