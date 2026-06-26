import { RawHtmlPage } from "@/components/RawHtmlPage";
import { pageMetadata } from "@/lib/site";
import { iaPage } from "@/lib/raw-pages";

export const metadata = pageMetadata({
  title: "Intelligence Artificielle - Obstraken",
  description:
    "IA souveraine Obstraken : modèles prédictifs, agents, copilotes métier et alertes en langage naturel sur un socle data fiable et sécurisé.",
  path: "/ia",
});

export default function IntelligenceArtificielle() {
  return <RawHtmlPage css={iaPage.css} html={iaPage.html} />;
}
