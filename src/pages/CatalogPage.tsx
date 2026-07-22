import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { SiteFooter } from '@/components/site/SiteFooter'
import { useSiteStore } from '@/store/useSiteStore'

export default function CatalogPage() {
  useDocumentTitle('Catálogo | Bicicletería Laprida')
  const navigate = useNavigate()
  const content = useSiteStore((state) => state.content)
  const loading = useSiteStore((state) => state.loading)

  const { categories, products, settings } = content
  const [activeCategory, setActiveCategory] = useState('Todos')

  const tabs = useMemo(
    () => ['Todos', ...categories.filter((item) => item.visible).map((item) => item.name)],
    [categories],
  )

  const filteredProducts = useMemo(() => {
    const visibleProducts = products.filter((item) => item.visible)
    if (activeCategory === 'Todos') {
      return visibleProducts
    }

    return visibleProducts.filter((item) => item.categoryName === activeCategory)
  }, [activeCategory, products])

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <Link className="catalog-brand" to="/">
          <img src={settings.footerLogoUrl} alt={settings.brandName} />
          <span>{settings.brandShortName}</span>
        </Link>

        <Link className="catalog-back" to="/">
          ← Inicio
        </Link>

        <a href={settings.whatsappUrl} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </header>

      <section className="catalog-hero">
        <h1>{settings.catalogTitle}</h1>
        <p>{settings.catalogDescription}</p>
      </section>

      <section className="catalog-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`catalog-tab ${tab === activeCategory ? 'catalog-tab-active' : ''}`}
            onClick={() => setActiveCategory(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </section>

      <section className="catalog-grid">
        {filteredProducts.map((product) => (
          <article
            key={product.id}
            className="product-card catalog-product-card product-card-clickable"
            onClick={() => navigate(`/producto/${product.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                navigate(`/producto/${product.id}`)
              }
            }}
          >
            <div className="product-card-image-frame catalog-product-image">
              <img src={(product.images && product.images[0]) || product.imageUrl} alt={product.name} />
            </div>
            <div className="product-card-body">
              <span className="product-card-category">{product.categoryName}</span>
              <h3>{product.name}</h3>
              <p className="product-card-description">{product.description}</p>
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                {settings.whatsappLabel}
              </a>
            </div>
          </article>
        ))}

        {!loading && filteredProducts.length === 0 ? (
          <div className="catalog-empty">No hay productos en esta categoría por ahora.</div>
        ) : null}
      </section>

      <SiteFooter settings={settings} />

      <a className="floating-whatsapp" href={settings.whatsappUrl} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
    </div>
  )
}
