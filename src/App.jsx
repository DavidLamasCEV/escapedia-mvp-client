import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

// Publicas
import HomePage           from './pages/HomePage'
import RoomDetailPage     from './pages/RoomDetailPage'
import LoginPage          from './pages/LoginPage'
import RegisterPage       from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage  from './pages/ResetPasswordPage'

// Locales publicos
import LocalesCatalogPage    from './pages/LocalesCatalogPage'
import LocalPublicDetailPage from './pages/LocalPublicDetailPage'

// Privadas usuario
import ProfilePage      from './pages/ProfilePage'
import MyBookingsPage   from './pages/MyBookingsPage'
import CreateReviewPage from './pages/CreateReviewPage'

// Privadas owner
import OwnerRoomsPage    from './pages/OwnerRoomsPage'
import RoomFormPage      from './pages/RoomFormPage'
import OwnerBookingsPage from './pages/OwnerBookingsPage'

// Privadas admin
import LocalesAdminPage from './pages/LocalesAdminPage'

function App() {
  return (
    <>
      <Navbar />

      <div className="container my-4">
        <Routes>
          {/* Publicas */}
          <Route path="/"               element={<HomePage />} />
          <Route path="/salas/:id"      element={<RoomDetailPage />} />

          <Route path="/locales"        element={<LocalesCatalogPage />} />
          <Route path="/locales/:id"    element={<LocalPublicDetailPage />} />

          <Route path="/login"          element={<LoginPage />} />
          <Route path="/register"       element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />

          {/* Privadas */}
          <Route path="/perfil" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
          <Route path="/mis-reservas" element={
            <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
          } />
          <Route path="/reviews/nueva" element={
            <ProtectedRoute><CreateReviewPage /></ProtectedRoute>
          } />

          <Route path="/owner/salas" element={
            <ProtectedRoute roles={['owner', 'admin']}><OwnerRoomsPage /></ProtectedRoute>
          } />
          <Route path="/owner/salas/nueva" element={
            <ProtectedRoute roles={['owner', 'admin']}><RoomFormPage /></ProtectedRoute>
          } />
          <Route path="/owner/salas/:id/editar" element={
            <ProtectedRoute roles={['owner', 'admin']}><RoomFormPage /></ProtectedRoute>
          } />
          <Route path="/owner/reservas" element={
            <ProtectedRoute roles={['owner', 'admin']}><OwnerBookingsPage /></ProtectedRoute>
          } />

          <Route path="/admin/locales" element={
            <ProtectedRoute roles={['admin']}><LocalesAdminPage /></ProtectedRoute>
          } />
        </Routes>
      </div>
    </>
  )
}

export default App
