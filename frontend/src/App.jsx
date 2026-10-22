import { Component } from 'react'
import { Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import { AuthProvider, useAuth } from './context/AuthContext'
import Auth from './pages/Auth'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import DinerMenu from './pages/DinerMenu'
import Home from './pages/Home'
import QrCode from './pages/QrCode'
import Upload from './pages/Upload'
import Verify from './pages/Verify'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('SureBite page error', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <main className="page flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-3xl">Something went wrong on this page.</h1>
        <p className="max-w-md text-sm text-muted">
          Reload to try again. If you are checking a menu for allergens, please ask the restaurant staff directly.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </main>
    )
  }
}

function ManagerLayout() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p className="page-loader" role="status">Checking your session…</p>
  if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar variant="manager" />
      <main className="page flex-1 py-8">
        <div key={location.pathname} className="animate-fade-up">
          <Outlet />
        </div>
      </main>
      <footer className="no-print page flex flex-wrap justify-between gap-2 py-6 text-xs text-muted">
        <span>SureBite · Restaurant workspace</span>
        <span>AI Infers. Humans Verify. Diners Stay Safe.</span>
      </footer>
    </div>
  )
}

function NotFound() {
  return (
    <main className="page flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="eyebrow">Page not found</p>
      <h1 className="text-3xl">We couldn’t find that page.</h1>
      <p className="max-w-md text-sm text-muted">
        If you scanned a QR code, the menu may no longer be available. Please ask the restaurant staff for a menu.
      </p>
      <Link to="/" className="btn btn-primary">
        Go to SureBite home
      </Link>
    </main>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/reset-password" element={<ForgotPassword />} />
          <Route path="/m/:slug" element={<DinerMenu />} />

          <Route element={<ManagerLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/menus/:id/verify" element={<Verify />} />
            <Route path="/menus/:id/qr" element={<QrCode />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
