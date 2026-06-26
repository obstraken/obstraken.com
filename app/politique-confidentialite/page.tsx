import { RawHtmlPage } from "@/components/RawHtmlPage";
import { pageMetadata } from "@/lib/site";
import { privacyPage } from "@/lib/raw-pages";

export const metadata = pageMetadata({
  title: "Politique de confidentialité - Obstraken",
  description: "Politique de confidentialité du site Obstraken.",
  path: "/politique-confidentialite",
});

export default function PolitiqueConfidentialite() {
  return <RawHtmlPage css={privacyPage.css} html={privacyPage.html} enableEffects={false} />;
}
