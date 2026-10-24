// Data
import { SEO, SITE_NAME, type SeoKey } from "@/data/seo";

interface SeoProps {
  page: SeoKey;
}

export function Seo({ page }: SeoProps) {
  const { title, description } = SEO[page];
  const fullTitle = `${title} | ${SITE_NAME}`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
    </>
  );
}
