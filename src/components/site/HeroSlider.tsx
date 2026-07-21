import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { SiteSettings } from '@/types/site'

type HeroSliderProps = {
  settings: SiteSettings
}

export function HeroSlider({ settings }: HeroSliderProps) {
  const slides = useMemo(
    () =>
      settings.heroSlides
        .filter((slide) => slide.visible)
        .sort((left, right) => left.order - right.order)
        .slice(0, 3),
    [settings.heroSlides],
  )

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
  }, [slides.length])

  useEffect(() => {
    if (slides.length <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [slides.length])

  if (!slides.length) {
    return null
  }

  const activeSlide = slides[activeIndex]
  const primaryIsExternal = /^https?:\/\//.test(activeSlide.ctaHref)

  return (
    <section className="landing-hero-slider">
      <div className="landing-badge landing-badge-slider">
        {settings.officialBadgeText.split(' ').map((part) => (
          <span key={part}>{part}</span>
        ))}
      </div>

      <div className="landing-hero-slider-viewport">
        {slides.map((slide, index) => (
          <article
            key={slide.id}
            className={`landing-hero-slide ${index === activeIndex ? 'landing-hero-slide-active' : ''}`}
          >
            <img className="landing-hero-slide-image" src={slide.imageUrl} alt={slide.title} />
          </article>
        ))}

        <div className="landing-hero-slider-overlay" />

        <div className="landing-hero-slider-content">
          <div className="landing-hero-slide-kicker">{settings.brandName}</div>
          <h1>{activeSlide.title}</h1>
          <p>{activeSlide.subtitle}</p>

          <div className="landing-hero-actions landing-hero-actions-slider">
            {primaryIsExternal ? (
              <a className="button-magenta" href={activeSlide.ctaHref} target="_blank" rel="noreferrer">
                {activeSlide.ctaLabel}
              </a>
            ) : (
              <Link className="button-magenta" to={activeSlide.ctaHref}>
                {activeSlide.ctaLabel}
              </Link>
            )}

            <a
              className="button-ghost"
              href={settings.heroSecondaryHref}
              target="_blank"
              rel="noreferrer"
            >
              {settings.heroSecondaryLabel}
            </a>
          </div>
        </div>

        {slides.length > 1 ? (
          <>
            <button
              aria-label="Slide anterior"
              className="landing-hero-nav landing-hero-nav-prev"
              onClick={() =>
                setActiveIndex((current) => (current - 1 + slides.length) % slides.length)
              }
              type="button"
            >
              ‹
            </button>
            <button
              aria-label="Slide siguiente"
              className="landing-hero-nav landing-hero-nav-next"
              onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
              type="button"
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {slides.length > 1 ? (
        <div className="landing-hero-dots">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              aria-label={`Ir al slide ${index + 1}`}
              className={`landing-hero-dot ${index === activeIndex ? 'landing-hero-dot-active' : ''}`}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
