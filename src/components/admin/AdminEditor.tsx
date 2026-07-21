import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { firebaseEnabled } from '@/lib/firebase'
import {
  loadLocalAdminCredentials,
  saveLocalAdminCredentials,
  signOutAdmin,
  uploadSiteImage,
} from '@/services/siteContent'
import { useSiteStore } from '@/store/useSiteStore'
import type { Brand, Category, CustomerItem, NewsItem, Product, SiteContent } from '@/types/site'

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`

type AdminTab =
  | 'branding'
  | 'productos'
  | 'estructura'
  | 'noticias'
  | 'clientes'
  | 'acceso'

type AccessDraft = {
  username: string
  password: string
}

export function AdminEditor() {
  const { content, save, saveState, seed, adminSession } = useAdminBindings()
  const [draft, setDraft] = useState<SiteContent>(content)
  const [accessDraft, setAccessDraft] = useState<AccessDraft>({ username: 'admin', password: '' })
  const [activeTab, setActiveTab] = useState<AdminTab>('branding')
  const [notice, setNotice] = useState<string | null>(null)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)

  useEffect(() => {
    setDraft(content)
  }, [content])

  useEffect(() => {
    if (!firebaseEnabled) {
      const localCredentials = loadLocalAdminCredentials()
      setAccessDraft({
        username: localCredentials.username,
        password: localCredentials.password,
      })
    }
  }, [])

  const visibleCategories = useMemo(
    () => draft.categories.filter((item) => item.visible),
    [draft.categories],
  )
  const visibleBrands = useMemo(() => draft.brands.filter((item) => item.visible), [draft.brands])

  const updateDraft = (updater: (current: SiteContent) => SiteContent) => {
    setDraft((current) => updater(current))
  }

  const updateSettingsField = (key: keyof SiteContent['settings'], value: string) => {
    updateDraft((current) => ({
      ...current,
      settings: { ...current.settings, [key]: value },
    }))
  }

  const handleSave = async () => {
    await save(draft)

    if (!firebaseEnabled) {
      saveLocalAdminCredentials(accessDraft)
    }

    setNotice('Cambios guardados correctamente')
    window.setTimeout(() => setNotice(null), 2500)
  }

  const handleReset = async () => {
    await seed()

    if (!firebaseEnabled) {
      const localCredentials = loadLocalAdminCredentials()
      setAccessDraft({
        username: localCredentials.username,
        password: localCredentials.password,
      })
    }
  }

  const withImageUpload = async (
    key: string,
    folder: string,
    updater: (imageUrl: string) => void,
    file?: File,
  ) => {
    if (!file) return
    setUploadingKey(key)
    try {
      const imageUrl = await uploadSiteImage(file, folder)
      updater(imageUrl)
    } finally {
      setUploadingKey(null)
    }
  }

  const updateProductField = (id: string, key: keyof Product, value: string | boolean | number) =>
    updateDraft((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === id ? { ...product, [key]: value } : product,
      ),
    }))

  const updateNews = (id: string, key: keyof NewsItem, value: string | boolean | number) =>
    updateDraft((current) => ({
      ...current,
      news: current.news.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    }))

  const updateCustomer = (
    id: string,
    key: keyof CustomerItem,
    value: string | boolean | number,
  ) =>
    updateDraft((current) => ({
      ...current,
      customers: current.customers.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    }))

  const updateCollection = <T extends Category | Brand>(
    collectionKey: 'categories' | 'brands',
    id: string,
    patch: Partial<T>,
  ) =>
    updateDraft((current) => ({
      ...current,
      [collectionKey]: current[collectionKey].map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }))

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src={draft.settings.footerLogoUrl} alt="Laprida" />
          <span>ADMIN</span>
        </div>

        <button
          className={activeTab === 'branding' ? 'active' : ''}
          onClick={() => setActiveTab('branding')}
          type="button"
        >
          Landing
        </button>
        <button
          className={activeTab === 'productos' ? 'active' : ''}
          onClick={() => setActiveTab('productos')}
          type="button"
        >
          Productos
        </button>
        <button
          className={activeTab === 'estructura' ? 'active' : ''}
          onClick={() => setActiveTab('estructura')}
          type="button"
        >
          Estructura
        </button>
        <button
          className={activeTab === 'noticias' ? 'active' : ''}
          onClick={() => setActiveTab('noticias')}
          type="button"
        >
          Noticias
        </button>
        <button
          className={activeTab === 'clientes' ? 'active' : ''}
          onClick={() => setActiveTab('clientes')}
          type="button"
        >
          Clientes
        </button>
        <button
          className={activeTab === 'acceso' ? 'active' : ''}
          onClick={() => setActiveTab('acceso')}
          type="button"
        >
          Acceso admin
        </button>

        <div className="admin-sidebar-footer">
          <Link to="/">← Ver sitio</Link>
          <button onClick={() => signOutAdmin()} type="button">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1>Panel autoadministrable</h1>
            <p>
              {firebaseEnabled
                ? `Sesión activa como ${adminSession.email || 'administrador'} con guardado remoto en Firebase.`
                : 'Modo demo local con usuario y contraseña editables desde este panel.'}
            </p>
          </div>

          <div className="admin-topbar-actions">
            <button className="secondary" onClick={handleReset} type="button">
              Restaurar semilla
            </button>
            <button onClick={handleSave} type="button">
              {saveState ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>

        {notice ? <div className="admin-success-banner">{notice}</div> : null}

        {activeTab === 'branding' ? (
          <section className="admin-section admin-columns">
            <div className="admin-card">
              <div className="admin-section-head">
                <h2>Branding y navegación</h2>
              </div>

              <label>
                Nombre comercial
                <input
                  value={draft.settings.brandName}
                  onChange={(event) => updateSettingsField('brandName', event.target.value)}
                />
              </label>
              <label>
                Nombre corto
                <input
                  value={draft.settings.brandShortName}
                  onChange={(event) => updateSettingsField('brandShortName', event.target.value)}
                />
              </label>
              <label>
                Texto acceso admin
                <input
                  value={draft.settings.adminAccessLabel}
                  onChange={(event) => updateSettingsField('adminAccessLabel', event.target.value)}
                />
              </label>
              <label>
                Logo header
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    withImageUpload(
                      'header-logo',
                      'branding',
                      (imageUrl) => updateSettingsField('headerLogoUrl', imageUrl),
                      event.target.files?.[0],
                    )
                  }
                />
              </label>
              <img
                className="admin-card-image compact"
                src={draft.settings.headerLogoUrl}
                alt="Logo header"
              />
              <label>
                Logo footer / catálogo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    withImageUpload(
                      'footer-logo',
                      'branding',
                      (imageUrl) => updateSettingsField('footerLogoUrl', imageUrl),
                      event.target.files?.[0],
                    )
                  }
                />
              </label>
              <img
                className="admin-card-image compact"
                src={draft.settings.footerLogoUrl}
                alt="Logo footer"
              />
              {uploadingKey ? <div className="admin-help-text">Subiendo imagen...</div> : null}
            </div>

            <div className="admin-card">
              <div className="admin-section-head">
                <h2>Hero principal</h2>
              </div>

              <label>
                Título superior
                <input
                  value={draft.settings.heroTitle}
                  onChange={(event) => updateSettingsField('heroTitle', event.target.value)}
                />
              </label>
              <label>
                Título destacado
                <input
                  value={draft.settings.heroHighlight}
                  onChange={(event) => updateSettingsField('heroHighlight', event.target.value)}
                />
              </label>
              <label>
                Descripción
                <textarea
                  value={draft.settings.heroDescription}
                  onChange={(event) => updateSettingsField('heroDescription', event.target.value)}
                  rows={4}
                />
              </label>
              <label>
                Badge oficial
                <input
                  value={draft.settings.officialBadgeText}
                  onChange={(event) => updateSettingsField('officialBadgeText', event.target.value)}
                />
              </label>
              <label>
                CTA principal
                <input
                  value={draft.settings.heroPrimaryLabel}
                  onChange={(event) => updateSettingsField('heroPrimaryLabel', event.target.value)}
                />
              </label>
              <label>
                Link CTA principal
                <input
                  value={draft.settings.heroPrimaryHref}
                  onChange={(event) => updateSettingsField('heroPrimaryHref', event.target.value)}
                />
              </label>
              <label>
                CTA secundario
                <input
                  value={draft.settings.heroSecondaryLabel}
                  onChange={(event) =>
                    updateSettingsField('heroSecondaryLabel', event.target.value)
                  }
                />
              </label>
              <label>
                Link CTA secundario
                <input
                  value={draft.settings.heroSecondaryHref}
                  onChange={(event) =>
                    updateSettingsField('heroSecondaryHref', event.target.value)
                  }
                />
              </label>
            </div>

            <div className="admin-card">
              <div className="admin-section-head">
                <h2>Secciones y contacto</h2>
              </div>

              <label>
                Texto cintillo
                <textarea
                  value={draft.settings.marqueeText}
                  onChange={(event) => updateSettingsField('marqueeText', event.target.value)}
                  rows={4}
                />
              </label>
              <label>
                Título catálogo
                <input
                  value={draft.settings.catalogTitle}
                  onChange={(event) => updateSettingsField('catalogTitle', event.target.value)}
                />
              </label>
              <label>
                Descripción catálogo
                <textarea
                  value={draft.settings.catalogDescription}
                  onChange={(event) =>
                    updateSettingsField('catalogDescription', event.target.value)
                  }
                  rows={3}
                />
              </label>
              <label>
                Texto link catálogo
                <input
                  value={draft.settings.catalogCtaLabel}
                  onChange={(event) => updateSettingsField('catalogCtaLabel', event.target.value)}
                />
              </label>
              <label>
                Título noticias
                <input
                  value={draft.settings.newsTitle}
                  onChange={(event) => updateSettingsField('newsTitle', event.target.value)}
                />
              </label>
              <label>
                Título clientes
                <input
                  value={draft.settings.customersTitle}
                  onChange={(event) => updateSettingsField('customersTitle', event.target.value)}
                />
              </label>
              <label>
                URL WhatsApp
                <input
                  value={draft.settings.whatsappUrl}
                  onChange={(event) => updateSettingsField('whatsappUrl', event.target.value)}
                />
              </label>
              <label>
                Texto WhatsApp
                <input
                  value={draft.settings.whatsappLabel}
                  onChange={(event) => updateSettingsField('whatsappLabel', event.target.value)}
                />
              </label>
              <label>
                URL Instagram
                <input
                  value={draft.settings.instagramUrl}
                  onChange={(event) => updateSettingsField('instagramUrl', event.target.value)}
                />
              </label>
              <label>
                Handle Instagram
                <input
                  value={draft.settings.instagramHandle}
                  onChange={(event) => updateSettingsField('instagramHandle', event.target.value)}
                />
              </label>
              <label>
                Ubicación
                <input
                  value={draft.settings.locationText}
                  onChange={(event) => updateSettingsField('locationText', event.target.value)}
                />
              </label>
              <label>
                Texto de envíos
                <input
                  value={draft.settings.shippingText}
                  onChange={(event) => updateSettingsField('shippingText', event.target.value)}
                />
              </label>
              <label>
                Texto legal
                <textarea
                  value={draft.settings.legalText}
                  onChange={(event) => updateSettingsField('legalText', event.target.value)}
                  rows={3}
                />
              </label>
            </div>
          </section>
        ) : null}

        {activeTab === 'productos' ? (
          <section className="admin-section">
            <div className="admin-section-head">
              <h2>Productos y destacados</h2>
              <button
                onClick={() =>
                  updateDraft((current) => ({
                    ...current,
                    products: [
                      ...current.products,
                      {
                        id: uid('prod'),
                        name: 'Nuevo producto',
                        categoryId: visibleCategories[0]?.id || '',
                        categoryName: visibleCategories[0]?.name || '',
                        brandId: visibleBrands[0]?.id,
                        brandName: visibleBrands[0]?.name || '',
                        imageUrl: '/assets/casco-integral.jpg',
                        featured: false,
                        visible: true,
                        order: current.products.length + 1,
                      },
                    ],
                  }))
                }
                type="button"
              >
                + Nuevo producto
              </button>
            </div>

            <div className="admin-grid-cards">
              {draft.products.map((product) => (
                <article key={product.id} className="admin-card">
                  <img className="admin-card-image" src={product.imageUrl} alt={product.name} />
                  <label>
                    Nombre
                    <input
                      value={product.name}
                      onChange={(event) => updateProductField(product.id, 'name', event.target.value)}
                    />
                  </label>
                  <label>
                    Categoría
                    <select
                      value={product.categoryId}
                      onChange={(event) => {
                        const category = draft.categories.find(
                          (item) => item.id === event.target.value,
                        )
                        updateDraft((current) => ({
                          ...current,
                          products: current.products.map((item) =>
                            item.id === product.id
                              ? {
                                  ...item,
                                  categoryId: category?.id || '',
                                  categoryName: category?.name || '',
                                }
                              : item,
                          ),
                        }))
                      }}
                    >
                      {draft.categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Marca
                    <select
                      value={product.brandName || ''}
                      onChange={(event) => updateProductField(product.id, 'brandName', event.target.value)}
                    >
                      <option value="">Sin marca</option>
                      {draft.brands.map((brand) => (
                        <option key={brand.id} value={brand.name}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Orden
                    <input
                      value={product.order}
                      onChange={(event) =>
                        updateProductField(product.id, 'order', Number(event.target.value) || 0)
                      }
                      type="number"
                    />
                  </label>
                  <label className="admin-checkbox">
                    <input
                      checked={product.featured}
                      onChange={(event) =>
                        updateProductField(product.id, 'featured', event.target.checked)
                      }
                      type="checkbox"
                    />
                    Destacado en home
                  </label>
                  <label className="admin-checkbox">
                    <input
                      checked={product.visible}
                      onChange={(event) =>
                        updateProductField(product.id, 'visible', event.target.checked)
                      }
                      type="checkbox"
                    />
                    Visible
                  </label>
                  <label>
                    Imagen
                    <input
                      onChange={(event) =>
                        withImageUpload(
                          `product-${product.id}`,
                          'products',
                          (imageUrl) => updateProductField(product.id, 'imageUrl', imageUrl),
                          event.target.files?.[0],
                        )
                      }
                      type="file"
                      accept="image/*"
                    />
                  </label>
                  <button
                    className="danger"
                    onClick={() =>
                      updateDraft((current) => ({
                        ...current,
                        products: current.products.filter((item) => item.id !== product.id),
                      }))
                    }
                    type="button"
                  >
                    Eliminar
                  </button>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === 'estructura' ? (
          <section className="admin-section admin-columns">
            <div className="admin-card">
              <div className="admin-section-head">
                <h2>Categorías</h2>
                <button
                  onClick={() =>
                    updateDraft((current) => ({
                      ...current,
                      categories: [
                        ...current.categories,
                        {
                          id: uid('cat'),
                          name: 'Nueva categoría',
                          order: current.categories.length + 1,
                          visible: true,
                        },
                      ],
                    }))
                  }
                  type="button"
                >
                  + Agregar
                </button>
              </div>

              {draft.categories.map((category) => (
                <div key={category.id} className="admin-inline-row">
                  <input
                    value={category.name}
                    onChange={(event) =>
                      updateCollection<Category>('categories', category.id, {
                        name: event.target.value,
                      })
                    }
                  />
                  <input
                    value={category.order}
                    onChange={(event) =>
                      updateCollection<Category>('categories', category.id, {
                        order: Number(event.target.value) || 0,
                      })
                    }
                    type="number"
                  />
                  <label className="admin-checkbox compact">
                    <input
                      checked={category.visible}
                      onChange={(event) =>
                        updateCollection<Category>('categories', category.id, {
                          visible: event.target.checked,
                        })
                      }
                      type="checkbox"
                    />
                    Visible
                  </label>
                  <button
                    className="danger"
                    onClick={() =>
                      updateDraft((current) => ({
                        ...current,
                        categories: current.categories.filter((item) => item.id !== category.id),
                      }))
                    }
                    type="button"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>

            <div className="admin-card">
              <div className="admin-section-head">
                <h2>Marcas</h2>
                <button
                  onClick={() =>
                    updateDraft((current) => ({
                      ...current,
                      brands: [
                        ...current.brands,
                        {
                          id: uid('brand'),
                          name: 'Nueva marca',
                          order: current.brands.length + 1,
                          visible: true,
                        },
                      ],
                    }))
                  }
                  type="button"
                >
                  + Agregar
                </button>
              </div>

              {draft.brands.map((brand) => (
                <div key={brand.id} className="admin-inline-row">
                  <input
                    value={brand.name}
                    onChange={(event) =>
                      updateCollection<Brand>('brands', brand.id, { name: event.target.value })
                    }
                  />
                  <input
                    value={brand.order}
                    onChange={(event) =>
                      updateCollection<Brand>('brands', brand.id, {
                        order: Number(event.target.value) || 0,
                      })
                    }
                    type="number"
                  />
                  <label className="admin-checkbox compact">
                    <input
                      checked={brand.visible}
                      onChange={(event) =>
                        updateCollection<Brand>('brands', brand.id, {
                          visible: event.target.checked,
                        })
                      }
                      type="checkbox"
                    />
                    Visible
                  </label>
                  <button
                    className="danger"
                    onClick={() =>
                      updateDraft((current) => ({
                        ...current,
                        brands: current.brands.filter((item) => item.id !== brand.id),
                      }))
                    }
                    type="button"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === 'noticias' ? (
          <section className="admin-section">
            <div className="admin-section-head">
              <h2>Noticias y agenda</h2>
              <button
                onClick={() =>
                  updateDraft((current) => ({
                    ...current,
                    news: [
                      ...current.news,
                      {
                        id: uid('news'),
                        dateLabel: 'NUEVO',
                        title: 'Nueva noticia',
                        description: 'Detalle editable',
                        order: current.news.length + 1,
                        visible: true,
                      },
                    ],
                  }))
                }
                type="button"
              >
                + Nueva noticia
              </button>
            </div>

            <div className="admin-grid-cards">
              {draft.news.map((item) => (
                <div key={item.id} className="admin-card">
                  <label>
                    Fecha corta
                    <input
                      value={item.dateLabel}
                      onChange={(event) => updateNews(item.id, 'dateLabel', event.target.value)}
                    />
                  </label>
                  <label>
                    Título
                    <input
                      value={item.title}
                      onChange={(event) => updateNews(item.id, 'title', event.target.value)}
                    />
                  </label>
                  <label>
                    Descripción
                    <textarea
                      value={item.description}
                      onChange={(event) => updateNews(item.id, 'description', event.target.value)}
                      rows={4}
                    />
                  </label>
                  <label>
                    Orden
                    <input
                      value={item.order}
                      onChange={(event) =>
                        updateNews(item.id, 'order', Number(event.target.value) || 0)
                      }
                      type="number"
                    />
                  </label>
                  <label className="admin-checkbox">
                    <input
                      checked={item.visible}
                      onChange={(event) => updateNews(item.id, 'visible', event.target.checked)}
                      type="checkbox"
                    />
                    Visible
                  </label>
                  <button
                    className="danger"
                    onClick={() =>
                      updateDraft((current) => ({
                        ...current,
                        news: current.news.filter((newsItem) => newsItem.id !== item.id),
                      }))
                    }
                    type="button"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === 'clientes' ? (
          <section className="admin-section">
            <div className="admin-section-head">
              <h2>Clientes y galería</h2>
              <button
                onClick={() =>
                  updateDraft((current) => ({
                    ...current,
                    customers: [
                      ...current.customers,
                      {
                        id: uid('customer'),
                        imageUrl:
                          '/uploads/502847922_4120521591502643_698345001009413750_n.jpg',
                        caption: 'Nuevo cliente',
                        order: current.customers.length + 1,
                        visible: true,
                      },
                    ],
                  }))
                }
                type="button"
              >
                + Nuevo cliente
              </button>
            </div>

            <div className="admin-grid-cards">
              {draft.customers.map((item) => (
                <div key={item.id} className="admin-card">
                  <img className="admin-card-image" src={item.imageUrl} alt={item.caption} />
                  <label>
                    Texto
                    <input
                      value={item.caption}
                      onChange={(event) => updateCustomer(item.id, 'caption', event.target.value)}
                    />
                  </label>
                  <label>
                    Imagen
                    <input
                      onChange={(event) =>
                        withImageUpload(
                          `customer-${item.id}`,
                          'customers',
                          (imageUrl) => updateCustomer(item.id, 'imageUrl', imageUrl),
                          event.target.files?.[0],
                        )
                      }
                      type="file"
                      accept="image/*"
                    />
                  </label>
                  <label>
                    Orden
                    <input
                      value={item.order}
                      onChange={(event) =>
                        updateCustomer(item.id, 'order', Number(event.target.value) || 0)
                      }
                      type="number"
                    />
                  </label>
                  <label className="admin-checkbox">
                    <input
                      checked={item.visible}
                      onChange={(event) =>
                        updateCustomer(item.id, 'visible', event.target.checked)
                      }
                      type="checkbox"
                    />
                    Visible
                  </label>
                  <button
                    className="danger"
                    onClick={() =>
                      updateDraft((current) => ({
                        ...current,
                        customers: current.customers.filter((customer) => customer.id !== item.id),
                      }))
                    }
                    type="button"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === 'acceso' ? (
          <section className="admin-section admin-columns">
            <div className="admin-card">
              <div className="admin-section-head">
                <h2>Ingreso desde la landing</h2>
              </div>

              <p className="admin-help-text">
                El acceso se hace desde el enlace "{draft.settings.adminAccessLabel}" visible en la
                cabecera y el footer del sitio.
              </p>

              {!firebaseEnabled ? (
                <>
                  <label>
                    Usuario admin
                    <input
                      value={accessDraft.username}
                      onChange={(event) =>
                        setAccessDraft((current) => ({
                          ...current,
                          username: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Contraseña admin
                    <input
                      value={accessDraft.password}
                      onChange={(event) =>
                        setAccessDraft((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      type="text"
                    />
                  </label>
                  <p className="admin-help-text">
                    Al guardar, estas credenciales pasan a ser las válidas para entrar al panel en
                    modo local.
                  </p>
                </>
              ) : (
                <p className="admin-help-text">
                  En modo Firebase, el login usa usuario o email y contraseña. Si ingresás con
                  usuario, se resuelve desde la colección `adminProfiles` con los campos `username`
                  y `email`.
                </p>
              )}
            </div>

            <div className="admin-card">
              <div className="admin-section-head">
                <h2>Resumen editable</h2>
              </div>

              <div className="admin-summary-line">
                <strong>Landing</strong>
                <span>Logo, hero, cintillo, títulos, contacto y CTA</span>
              </div>
              <div className="admin-summary-line">
                <strong>Catálogo</strong>
                <span>Productos, destacados, categorías, marcas y descripción</span>
              </div>
              <div className="admin-summary-line">
                <strong>Noticias</strong>
                <span>Fechas, títulos, textos, orden y visibilidad</span>
              </div>
              <div className="admin-summary-line">
                <strong>Clientes</strong>
                <span>Fotos, textos, orden y visibilidad</span>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  )
}

function useAdminBindings() {
  const content = useSiteStore((state) => state.content)
  const save = useSiteStore((state) => state.save)
  const seed = useSiteStore((state) => state.seed)
  const saving = useSiteStore((state) => state.saving)
  const adminSession = useSiteStore((state) => state.adminSession)

  return {
    content,
    save,
    seed,
    saveState: saving,
    adminSession,
  }
}
