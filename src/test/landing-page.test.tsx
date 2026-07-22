import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { siteSeed } from '@/data/siteSeed'
import LandingPage from '@/pages/LandingPage'
import { useSiteStore } from '@/store/useSiteStore'

describe('LandingPage', () => {
  it('muestra el hero y los productos destacados del boceto', () => {
    useSiteStore.setState({
      content: siteSeed,
      loading: false,
      saving: false,
      seeded: true,
      error: null,
      adminSession: { email: null, isAuthenticated: false },
    })

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('SLP 500 PRO R29')).toBeInTheDocument()
    expect(screen.getByText('KTM Aro 29 MTB')).toBeInTheDocument()
    expect(screen.getByText(/Mountain bike rodado 29 ideal/i)).toBeInTheDocument()
    expect(screen.getByText('Cicloturismo nocturno')).toBeInTheDocument()
  })
})
