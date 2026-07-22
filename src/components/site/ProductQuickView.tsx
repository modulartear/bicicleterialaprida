import { useEffect, useMemo, useState } from 'react'
import type { Product, SiteSettings } from '@/types/site'

type ProductQuickViewProps = {
  product: Product | null
  settings: SiteSettings
  onClose: () => void
}

export function ProductQuickView({ product, settings, onClose }: ProductQuickViewProps) {
  const images = useMemo(() => {
    if (!product) {
      return []
    }

    return product.images?.length ? product.images : [product.imageUrl]
  }, [product])

  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    setActiveImage(0)
  }, [product?.id])

  useEffect(() => {
    if (!product) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose, product])

  if (!product) {
    return null
  }

  return (
    <div className="product-quickview-backdrop" onClick={onClose} role="presentation">
      <div
        className="product-quickview"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
      >
        <button className="product-quickview-close" onClick={onClose} type="button">
          ×
        </button>

        <div className="product-quickview-gallery">
          <div className="product-quickview-main-image">
            <img src={images[activeImage] || product.imageUrl} alt={product.name} />
          </div>

          {images.length > 1 ? (
            <div className="product-quickview-thumbs">
              {images.map((imageUrl, index) => (
                <button
                  key={`${product.id}-${index}`}
                  className={`product-quickview-thumb ${index === activeImage ? 'product-quickview-thumb-active' : ''}`}
                  onClick={() => setActiveImage(index)}
                  type="button"
                >
                  <img src={imageUrl} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="product-quickview-info">
          <span className="product-card-category">{product.categoryName}</span>
          <h2>{product.name}</h2>
          {product.brandName ? <div className="product-quickview-brand">Marca: {product.brandName}</div> : null}
          <p>{product.description || 'Consultanos por disponibilidad, colores, talle o variantes.'}</p>

          <div className="product-quickview-actions">
            <a className="button-magenta" href={settings.whatsappUrl} target="_blank" rel="noreferrer">
              {settings.whatsappLabel}
            </a>
            <button className="button-dark" onClick={onClose} type="button">
              Seguir viendo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
