import { Helmet } from "react-helmet";
import { CONTACT, COMPANY_INFO, LOCATIONS } from "@/data/cars";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const SITE_URL = "https://vinfastbienhoa.com.vn";
const BRAND_NAME = "VinFast Kim Sơn";
const DEFAULT_TITLE = "VinFast Kim Sơn - Đại Lý Xe Điện VinFast Chính Hãng Biên Hòa, Đồng Nai";
const DEFAULT_OG_TITLE = "VinFast Kim Sơn - Hệ Thống Nhà Phân Phối Xe Điện VinFast Lớn Nhất Miền Nam";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-banner.jpg`;
const DEFAULT_KEYWORDS =
  "vinfast kim sơn, vinfast biên hòa, vinfast đồng nai, đại lý vinfast, xe điện vinfast, nhà phân phối vinfast miền nam, mua xe vinfast, giá xe vinfast, vf3, vf5, vf6, vf7, vf8, vf9, vinfast wild";

const absoluteUrl = (value) => {
  if (!value) return DEFAULT_OG_IMAGE;
  try {
    return new URL(value, SITE_URL).href;
  } catch {
    return DEFAULT_OG_IMAGE;
  }
};

const buildOrgSchema = (settings) => ({
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  "@id": `${SITE_URL}/#organization`,
  name: "VinFast Kim Sơn",
  alternateName: ["VinFast Biên Hòa", "VinFast Đồng Nai", "Hệ Thống Nhà Phân Phối Kim Sơn"],
  description:
    "VinFast Kim Sơn - Nhà phân phối VinFast lớn nhất miền Nam. Chuyên cung cấp các dòng xe điện VinFast VF3, VF5, VF6, VF7, VF8, VF9, Wild và xe dịch vụ tại Biên Hòa, Đồng Nai.",
  url: SITE_URL,
  logo: `${SITE_URL}/og-banner.jpg`,
  image: `${SITE_URL}/og-banner.jpg`,
  telephone: settings.hotline_kd.replace(/\D/g, "") || "0913757579",
  email: settings.email || CONTACT.email,
  priceRange: "269.000.000đ - 1.348.000.000đ",
  brand: { "@type": "Brand", name: "VinFast" },
  address: {
    "@type": "PostalAddress",
    streetAddress: "643 Quốc Lộ 1, Khu Phố 27, Phường Long Bình",
    addressLocality: "Biên Hòa",
    addressRegion: "Đồng Nai",
    addressCountry: "VN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 10.942478,
    longitude: 106.883584,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "08:00",
      closes: "20:00",
    },
  ],
  areaServed: [
    { "@type": "City", name: "Biên Hòa" },
    { "@type": "State", name: "Đồng Nai" },
    { "@type": "City", name: "TP. Hồ Chí Minh" },
  ],
  taxID: CONTACT.mst,
  location: LOCATIONS.map((l) => ({
    "@type": "AutoDealer",
    name: l.name,
    address: { "@type": "PostalAddress", streetAddress: l.address, addressCountry: "VN" },
  })),
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: settings.hotline_kd.replace(/\D/g, "") || "0913757579",
      contactType: "sales",
      areaServed: "VN",
      availableLanguage: "Vietnamese",
    },
    {
      "@type": "ContactPoint",
      telephone: settings.hotline_dv.replace(/\D/g, "") || "0917300008",
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: "Vietnamese",
    },
  ],
});

const buildBreadcrumbSchema = (items) => {
  if (!items || !items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang chủ", item: SITE_URL },
      ...items.map((it, idx) => ({
        "@type": "ListItem",
        position: idx + 2,
        name: it.name,
        item: `${SITE_URL}${it.path}`,
      })),
    ],
  };
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: BRAND_NAME,
  url: SITE_URL,
  inLanguage: "vi-VN",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

const Seo = ({
  title,
  description,
  keywords = DEFAULT_KEYWORDS,
  path = "/",
  image,
  type = "website",
  schema,
  breadcrumb,
}) => {
  const { settings } = useSiteSettings();
  const tabTitle = title
    ? (title.includes("VinFast") ? title : `${title} | ${BRAND_NAME}`)
    : DEFAULT_TITLE;
  const ogTitle = title ? tabTitle : DEFAULT_OG_TITLE;
  const canonical = `${SITE_URL}${path}`;
  const desc = description || COMPANY_INFO.name;
  const rawImage = image || settings.logoUrl || DEFAULT_OG_IMAGE;
  const ogImage = absoluteUrl(rawImage);
  const orgSchema = buildOrgSchema(settings);
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumb);

  return (
    <Helmet>
      <html lang="vi" />
      <title>{tabTitle}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content="VinFast Kim Sơn" />
      <meta name="geo.region" content="VN-39" />
      <meta name="geo.placename" content="Đồng Nai, Biên Hòa" />
      <meta name="geo.position" content="10.942478;106.883584" />
      <meta name="ICBM" content="10.942478, 106.883584" />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook / Zalo */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="VinFast Kim Sơn" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      {ogImage.endsWith(".jpg") || ogImage.endsWith(".jpeg") ? (
        <meta property="og:image:type" content="image/jpeg" />
      ) : ogImage.endsWith(".png") ? (
        <meta property="og:image:type" content="image/png" />
      ) : ogImage.endsWith(".webp") ? (
        <meta property="og:image:type" content="image/webp" />
      ) : (
        <meta property="og:image:type" content="image/jpeg" />
      )}
      <meta property="og:image:width" content="1024" />
      <meta property="og:image:height" content="576" />
      <meta property="og:image:alt" content={ogTitle} />
      <meta property="og:locale" content="vi_VN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      {breadcrumbSchema && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      )}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
};

export default Seo;
