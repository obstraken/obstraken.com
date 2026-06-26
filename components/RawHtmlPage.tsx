import { SiteEffects } from "@/components/SiteEffects";

type RawHtmlPageProps = {
  css: string;
  html: string;
  enableEffects?: boolean;
};

export function RawHtmlPage({ css, html, enableEffects = true }: RawHtmlPageProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {enableEffects ? <SiteEffects /> : null}
    </>
  );
}
