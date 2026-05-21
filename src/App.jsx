import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard'
import AdminLayout from './pages/AdminLayout'
import AdminLogin from './pages/AdminLogin'
import AllRequests from './pages/AllRequests'
import ApprovedAgenda from './pages/ApprovedAgenda'
import HomePage from './pages/HomePage'
import NotFound from './pages/NotFound'
import PendingRequests from './pages/PendingRequests'
import RejectedRequests from './pages/RejectedRequests'
import SolicitationPage from './pages/SolicitationPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/solicitar" element={<SolicitationPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="solicitacoes" element={<PendingRequests />} />
          <Route path="agenda" element={<ApprovedAgenda />} />
          <Route path="rejeitadas" element={<RejectedRequests />} />
          <Route path="todas" element={<AllRequests />} />
        </Route>
        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
