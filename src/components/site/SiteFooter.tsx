import type { SiteSettings } from '@/types/site'

type SiteFooterProps = {
  settings: SiteSettings
}

export function SiteFooter({ settings }: SiteFooterProps) {
  return (
    <footer className="site-footer" id="contacto">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <img src={settings.footerLogoUrl} alt={settings.brandName} />
          <span>{settings.brandShortName}</span>
        </div>

        <div className="site-footer-copy">
          {settings.locationText}
          <br />
          {settings.shippingText} Argentina
        </div>

        <div className="site-footer-links">
          <a href={settings.instagramUrl} target="_blank" rel="noreferrer">
            {settings.instagramHandle}
          </a>
          <a href={settings.whatsappUrl} target="_blank" rel="noreferrer">
            {settings.whatsappLabel}
          </a>
          <a href="/admin/login">{settings.adminAccessLabel}</a>
        </div>
      </div>

      <div className="site-footer-legal">{settings.legalText}</div>
    </footer>
  )
}
