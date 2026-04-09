import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const base = 'https://pregnancytoolkits.lovable.app';
  
  const segments = location.pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const items: BreadcrumbItem[] = [
    { name: t('nav.home', 'Home'), url: base }
  ];

  let path = '';
  for (const seg of segments) {
    path += `/${seg}`;
    const name = seg
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    items.push({ name, url: `${base}${path}` });
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export default BreadcrumbSchema;
