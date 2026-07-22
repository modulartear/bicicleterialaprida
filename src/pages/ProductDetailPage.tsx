import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SiteFooter } from '@/components/site/SiteFooter'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSiteStore } from '@/store/useSiteStore'

export default function ProductDetailPage() {
  const { productId } = useParams()
  const content = useSiteStore((state) => state.content)
  const loading = useSiteStore((state) => state.loading)
  const { settings, products } = content

  const product = useMemo(
    () => products.find((item) => item.id === productId) || null,
    [productId, products],
  )

  const images = useMemo(() => {
    if (!product) return []
    return product.images?.length ? product.images : [product.imageUrl]
  }, [product])

  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    setActiveImage(0)
  }, [productId])

  useDocumentTitle(product ? `${product.name} | ${settings.brandShortName}` : `Producto | ${settings.brandShortName}`)

  if (loading && !product) {
    return <div className="admin-loading-state">Cargando...</div>
  }

  if (!product) {
    return (
      <div className="catalog-page">
        <header className="catalog-header">
          <Link className="catalog-brand" to="/">
            <img src={settings.footerLogoUrl} alt={settings.brandName} />
            <span>{settings.brandShortName}</span>
          </Link>
          <Link className="catalog-back" to="/catalogo">
            ← Catálogo
          </Link>
          <a href={settings.whatsappUrl} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </header>

        <section className="catalog-hero">
          <h1>Producto no encontrado</h1>
          <p>El producto que buscás no existe o fue ocultado.</p>
        </section>

        <SiteFooter settings={settings} />
      </div>
    )
  }

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <Link className="catalog-brand" to="/">
          <img src={settings.footerLogoUrl} alt={settings.brandName} />
          <span>{settings.brandShortName}</span>
        </Link>

        <Link className="catalog-back" to="/catalogo">
          ← Catálogo
        </Link>

        <a href={settings.whatsappUrl} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </header>

      <section className="product-detail">
        <div className="product-detail-gallery">
          <div className="product-detail-main-image">
            <img src={images[activeImage] || product.imageUrl} alt={product.name} />
          </div>

          {images.length > 1 ? (
            <div className="product-detail-thumbs">
              {images.map((imageUrl, index) => (
                <button
                  key={`${product.id}-${index}`}
                  className={`product-detail-thumb ${index === activeImage ? 'product-detail-thumb-active' : ''}`}
                  onClick={() => setActiveImage(index)}
                  type="button"
                >
                  <img src={imageUrl} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="product-detail-info">
          <span className="product-card-category">{product.categoryName}</span>
          <h1 className="product-detail-title">{product.name}</h1>
          {product.brandName ? <div className="product-detail-brand">Marca: {product.brandName}</div> : null}
          <p className="product-detail-description">
            {product.description || 'Consultanos por disponibilidad, colores, talle o variantes.'}
          </p>

          <div className="product-detail-actions">
            <a className="button-magenta" href={settings.whatsappUrl} target="_blank" rel="noreferrer">
              {settings.whatsappLabel}
            </a>
            <Link className="button-dark" to="/catalogo">
              Volver al catálogo
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter settings={settings} />

      <a className="floating-whatsapp" href={settings.whatsappUrl} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
    </div>
  )
}

