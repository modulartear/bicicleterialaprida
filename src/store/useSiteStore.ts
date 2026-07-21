import { create } from 'zustand'
import { siteSeed } from '@/data/siteSeed'
import {
  ensureLocalSeed,
  loadSiteContent,
  saveSiteContent,
  seedFirebaseContent,
  subscribeAdminSession,
} from '@/services/siteContent'
import type { SiteContent } from '@/types/site'

type AdminSession = {
  email: string | null
  isAuthenticated: boolean
}

type SiteStore = {
  content: SiteContent
  loading: boolean
  saving: boolean
  seeded: boolean
  error: string | null
  adminSession: AdminSession
  load: () => Promise<void>
  save: (next: SiteContent) => Promise<void>
  seed: () => Promise<void>
  watchAdminSession: () => () => void
}

export const useSiteStore = create<SiteStore>((set) => ({
  content: siteSeed,
  loading: true,
  saving: false,
  seeded: false,
  error: null,
  adminSession: {
    email: null,
    isAuthenticated: false,
  },
  load: async () => {
    try {
      set({ loading: true, error: null })
      await ensureLocalSeed()
      const content = await loadSiteContent()
      set({ content, loading: false, seeded: true })
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'No se pudo cargar el contenido',
      })
    }
  },
  save: async (next) => {
    try {
      set({ saving: true, error: null })
      await saveSiteContent(next)
      set({ content: next, saving: false })
    } catch (error) {
      set({
        saving: false,
        error: error instanceof Error ? error.message : 'No se pudo guardar el contenido',
      })
      throw error
    }
  },
  seed: async () => {
    try {
      set({ saving: true, error: null })
      await seedFirebaseContent()
      const content = await loadSiteContent()
      set({ content, saving: false, seeded: true })
    } catch (error) {
      set({
        saving: false,
        error: error instanceof Error ? error.message : 'No se pudo sembrar el contenido',
      })
    }
  },
  watchAdminSession: () =>
    subscribeAdminSession((adminSession) => {
      set({ adminSession })
    }),
}))
