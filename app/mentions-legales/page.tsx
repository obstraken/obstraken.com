import { RawHtmlPage } from "@/components/RawHtmlPage";
import { pageMetadata } from "@/lib/site";
import { legalNoticePage } from "@/lib/raw-pages";

export const metadata = pageMetadata({
  title: "Mentions légales - Obstraken",
  description: "Mentions légales du site Obstraken.",
  path: "/mentions-legales",
});

export default function MentionsLegales() {
  return <RawHtmlPage css={legalNoticePage.css} html={legalNoticePage.html} enableEffects={false} />;
}
