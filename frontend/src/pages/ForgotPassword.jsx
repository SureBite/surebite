import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api, { getErrorMessage } from '../api/api'
import { Logo } from '../components/Navbar'
import AuthSidebar from '../components/auth/AuthSidebar'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'

export function ForgotPassword() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleForgotPassword = async (email) => {
    setSubmitting(true)
    setError('')
    try {
      await api.auth.forgotPassword({ email })
      return true
    } catch (err) {
      setError(getErrorMessage(err))
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoToLogin = () => {
    navigate('/auth', { replace: true })
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="page flex items-center justify-between py-6">
        <Logo />
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} aria-hidden="true" /> Back to home
        </Link>
      </header>

      <main className="page grid gap-10 pb-16 lg:grid-cols-2 lg:gap-16">
        <AuthSidebar />

        <section className="mx-auto w-full max-w-md self-center">
          <ForgotPasswordForm
            onSubmit={handleForgotPassword}
            onGoToLogin={handleGoToLogin}
            submitting={submitting}
            error={error}
          />
        </section>
      </main>
    </div>
  )
}

export default ForgotPassword
