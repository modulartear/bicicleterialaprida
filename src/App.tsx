import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireAdmin } from '@/components/admin/RequireAdmin'
import { useBootstrap } from '@/hooks/useBootstrap'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import AdminLoginPage from '@/pages/AdminLoginPage'
import CatalogPage from '@/pages/CatalogPage'
import LandingPage from '@/pages/LandingPage'
import ProductDetailPage from '@/pages/ProductDetailPage'

export default function App() {
  useBootstrap()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/producto/:productId" element={<ProductDetailPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboardPage />
            </RequireAdmin>
          }
        />
        <Route path="/admin/productos" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/contenido" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/configuracion" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
