import { RawHtmlPage } from "@/components/RawHtmlPage";
import { pageMetadata } from "@/lib/site";
import { homePage } from "@/lib/raw-pages";

export const metadata = pageMetadata({
  title: "Obstraken - Bâtisseur d'usines de données et d'IA souveraines",
  description:
    "Obstraken bâtit votre usine de données souveraine, sécurisée et conforme, du diagnostic à l'IA. GCP natif, S3NS, Azure et Qlik.",
  path: "/",
});

export default function Home() {
  return <RawHtmlPage css={homePage.css} html={homePage.html} />;
}
