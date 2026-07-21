export type HeroSlide = {
  id: string
  imageUrl: string
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  visible: boolean
  order: number
}

export type SiteSettings = {
  brandName: string
  brandShortName: string
  headerLogoUrl: string
  footerLogoUrl: string
  instagramUrl: string
  instagramHandle: string
  whatsappUrl: string
  whatsappLabel: string
  locationText: string
  shippingText: string
  legalText: string
  heroTitle: string
  heroHighlight: string
  heroDescription: string
  heroPrimaryLabel: string
  heroPrimaryHref: string
  heroSecondaryLabel: string
  heroSecondaryHref: string
  officialBadgeText: string
  marqueeText: string
  catalogTitle: string
  catalogDescription: string
  catalogCtaLabel: string
  newsTitle: string
  newsCtaLabel: string
  customersTitle: string
  adminAccessLabel: string
  heroSlides: HeroSlide[]
}

export type Category = {
  id: string
  name: string
  order: number
  visible: boolean
}

export type Brand = {
  id: string
  name: string
  order: number
  visible: boolean
}

export type Product = {
  id: string
  name: string
  categoryId: string
  categoryName: string
  brandId?: string
  brandName?: string
  imageUrl: string
  featured: boolean
  visible: boolean
  order: number
}

export type NewsItem = {
  id: string
  dateLabel: string
  title: string
  description: string
  visible: boolean
  order: number
}

export type CustomerItem = {
  id: string
  imageUrl: string
  caption: string
  visible: boolean
  order: number
}

export type SiteContent = {
  settings: SiteSettings
  categories: Category[]
  brands: Brand[]
  products: Product[]
  news: NewsItem[]
  customers: CustomerItem[]
}

export type AdminCredentials = {
  username: string
  password: string
}
