import { Link } from 'react-router-dom'
import { HeroSlider } from '@/components/site/HeroSlider'
import { PublicHeader } from '@/components/site/PublicHeader'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { SiteFooter } from '@/components/site/SiteFooter'
import { useSiteStore } from '@/store/useSiteStore'

export default function LandingPage() {
  useDocumentTitle('Bicicletería Laprida')
  const content = useSiteStore((state) => state.content)
  const loading = useSiteStore((state) => state.loading)
  const error = useSiteStore((state) => state.error)

  const categories = content.categories.filter((item) => item.visible)
  const featuredProducts = content.products.filter((item) => item.visible && item.featured)
  const teaserProducts = (featuredProducts.length ? featuredProducts : content.products.filter((item) => item.visible)).slice(0, 6)
  const news = content.news.filter((item) => item.visible).slice(0, 3)
  const customers = content.customers.filter((item) => item.visible).slice(0, 6)
  const { settings } = content

  return (
    <div className="landing-page">
      <div className="landing-shell">
        <div className="landing-orb landing-orb-top" />
        <div className="landing-orb landing-orb-middle" />

        <PublicHeader settings={settings} />

        <HeroSlider settings={settings} />

        <section className="landing-marquee">
          <div className="landing-marquee-track">
            {settings.marqueeText} {settings.marqueeText}
          </div>
        </section>

        <section className="landing-categories">
          {categories.map((category) => (
            <div key={category.id} className="landing-category-card">
              {category.name}
            </div>
          ))}
        </section>

        <section className="landing-section" id="catalogo">
          <div className="landing-section-head">
            <h2>{settings.catalogTitle}</h2>
            <Link to="/catalogo">{settings.catalogCtaLabel}</Link>
          </div>

          <div className="landing-product-grid">
            {teaserProducts.map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-card-image-frame">
                  <img src={product.imageUrl} alt={product.name} />
                </div>
                <div className="product-card-body">
                  <span className="product-card-category">{product.categoryName}</span>
                  <h3>{product.name}</h3>
                  <a href={settings.whatsappUrl} target="_blank" rel="noreferrer">
                    Consultar por WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-news" id="noticias">
          <div className="landing-news-inner">
            <h2>{settings.newsTitle}</h2>

            <div className="landing-news-grid">
              {news.map((item) => (
                <article key={item.id} className="news-card">
                  <span>{item.dateLabel}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section" id="clientes">
          <div className="landing-section-head landing-section-head-start">
            <h2>{settings.customersTitle}</h2>
          </div>

          <div className="landing-customer-grid">
            {customers.map((customer) => (
              <article key={customer.id} className="customer-card">
                <div className="customer-card-image">
                  <img src={customer.imageUrl} alt={customer.caption} />
                </div>
                <div className="customer-card-caption">{customer.caption}</div>
              </article>
            ))}
          </div>
        </section>

        <SiteFooter settings={settings} />

        <a
          className="floating-whatsapp"
          href={settings.whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
      </div>

      {loading ? <div className="status-banner">Cargando contenido...</div> : null}
      {error ? <div className="status-banner status-banner-error">{error}</div> : null}
    </div>
  )
}
