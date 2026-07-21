import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { AdminEditor } from '@/components/admin/AdminEditor'

export default function AdminDashboardPage() {
  useDocumentTitle('Panel Admin | Bicicletería Laprida')
  return <AdminEditor />
}
