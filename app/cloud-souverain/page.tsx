import { RawHtmlPage } from "@/components/RawHtmlPage";
import { pageMetadata } from "@/lib/site";
import { cloudPage } from "@/lib/raw-pages";

export const metadata = pageMetadata({
  title: "Cloud souverain - Obstraken",
  description:
    "Cloud souverain Obstraken : architecture data sur GCP France, S3NS / PREMI3NS, sécurité, conformité, gouvernance et exploitation maîtrisée.",
  path: "/cloud-souverain",
});

export default function CloudSouverain() {
  return <RawHtmlPage css={cloudPage.css} html={cloudPage.html} />;
}
