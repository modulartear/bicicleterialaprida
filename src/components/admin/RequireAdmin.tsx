import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useSiteStore } from '@/store/useSiteStore'

type RequireAdminProps = {
  children: ReactElement
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const adminSession = useSiteStore((state) => state.adminSession)
  const loading = useSiteStore((state) => state.loading)

  if (loading) {
    return <div className="admin-loading-state">Cargando panel...</div>
  }

  if (!adminSession.isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
