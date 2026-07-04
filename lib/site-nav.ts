export const SITE_NAV_ITEMS = [
  { href: "/ai", label: "AI" },
  { href: "/ops", label: "运维" },
  { href: "/notes", label: "随记" },
  { href: "/archive", label: "归档" },
] as const

export const SITE_FOOTER_SITEMAP = [
  { href: "/", label: "首页" },
  ...SITE_NAV_ITEMS,
] as const

export const SITE_FOOTER_LEGAL = [
  { href: "/rss.xml", label: "RSS" },
  { href: "/atom.xml", label: "Atom" },
  { href: "/sitemap.xml", label: "站点地图" },
] as const

export const SITE_FOOTER_CONTACT = [
  { href: "#", label: "联系方式" },
] as const
