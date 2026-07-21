import { useEffect } from 'react'
import { useSiteStore } from '@/store/useSiteStore'

export function useBootstrap() {
  const load = useSiteStore((state) => state.load)
  const watchAdminSession = useSiteStore((state) => state.watchAdminSession)

  useEffect(() => {
    load()
    const unsubscribe = watchAdminSession()
    return () => unsubscribe()
  }, [load, watchAdminSession])
}
