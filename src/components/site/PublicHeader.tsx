import { Link } from 'react-router-dom'
import type { SiteSettings } from '@/types/site'

type PublicHeaderProps = {
  settings: SiteSettings
  dark?: boolean
}

export function PublicHeader({ settings, dark = false }: PublicHeaderProps) {
  return (
    <header className={`site-header ${dark ? 'site-header-dark' : ''}`}>
      {!dark ? (
        <>
          <img className="site-header-splash-left" src="/assets/nav-splash-left.png" alt="" />
          <img className="site-header-splash-right" src="/assets/nav-splash-right.png" alt="" />
        </>
      ) : null}

      <Link className="site-header-brand" to="/">
        <img
          className="site-header-logo"
          src={dark ? settings.footerLogoUrl : settings.headerLogoUrl}
          alt={settings.brandName}
        />
      </Link>

      <nav className={`site-header-nav ${dark ? 'site-header-nav-dark' : ''}`}>
        <a href="/#catalogo">Catálogo</a>
        <a href="/#noticias">Noticias</a>
        <a href="/#clientes">Clientes</a>
        <a href="/#contacto">Contacto</a>
      </nav>

      <div className="site-header-actions">
        <Link className="site-header-admin-link" to="/admin/login">
          {settings.adminAccessLabel}
        </Link>

        <a
          className="site-header-whatsapp"
          href={settings.whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
      </div>
    </header>
  )
}
