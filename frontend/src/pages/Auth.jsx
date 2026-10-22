import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api, { getErrorMessage } from '../api/api'
import { Logo } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import AuthSidebar from '../components/auth/AuthSidebar'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import OtpVerificationForm from '../components/auth/OtpVerificationForm'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'

export function Auth() {
  const { user, loading, login, register, verifyOtp, resendOtp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const mode = searchParams.get('mode') // 'register' | 'forgot' | null (login)
  const [step, setStep] = useState('form') // 'form' | 'otp'
  const [pendingEmail, setPendingEmail] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const destination = location.state?.from || '/dashboard'

  if (!loading && user) {
    return <Navigate to={destination} replace />
  }

  const switchMode = (newMode) => {
    setFormError('')
    setStep('form')
    if (newMode === 'login') {
      setSearchParams({}, { state: location.state, replace: true })
    } else {
      setSearchParams({ mode: newMode }, { state: location.state, replace: true })
    }
  }

  // Handle Login submission
  const handleLogin = async (credentials) => {
    setSubmitting(true)
    setFormError('')
    try {
      await login(credentials)
      navigate(destination, { replace: true })
    } catch (error) {
      if (error?.response?.data?.isUnverified) {
        setPendingEmail(error.response.data.email || credentials.email)
        setStep('otp')
      } else {
        setFormError(getErrorMessage(error))
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Registration submission: transitions immediately to OTP input screen
  const handleRegister = async (details) => {
    setSubmitting(true)
    setFormError('')
    try {
      await register(details)
      setPendingEmail(details.email)
      setStep('otp')
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  // Handle OTP verification: validates 6-digit code and activates account
  const handleVerifyOtp = async ({ email, otp }) => {
    setSubmitting(true)
    setFormError('')
    try {
      await verifyOtp({ email, otp })
      navigate(destination, { replace: true })
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  // Handle resending OTP code
  const handleResendOtp = async (email) => {
    await resendOtp(email)
  }

  // Handle Forgot Password submission
  const handleForgotPassword = async (email) => {
    setSubmitting(true)
    setFormError('')
    try {
      await api.auth.forgotPassword({ email })
      return true
    } catch (error) {
      setFormError(getErrorMessage(error))
      return false
    } finally {
      setSubmitting(false)
    }
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
          {step === 'otp' ? (
            <OtpVerificationForm
              email={pendingEmail}
              onVerify={handleVerifyOtp}
              onResend={handleResendOtp}
              onBackToRegister={() => {
                setStep('form')
                setFormError('')
              }}
              submitting={submitting}
              error={formError}
            />
          ) : mode === 'register' ? (
            <RegisterForm
              onSubmit={handleRegister}
              onSwitchToLogin={() => switchMode('login')}
              submitting={submitting}
              error={formError}
            />
          ) : mode === 'forgot' ? (
            <ForgotPasswordForm
              onSubmit={handleForgotPassword}
              onGoToLogin={() => switchMode('login')}
              submitting={submitting}
              error={formError}
            />
          ) : (
            <LoginForm
              onSubmit={handleLogin}
              onSwitchToRegister={() => switchMode('register')}
              onForgotPassword={() => switchMode('forgot')}
              submitting={submitting}
              error={formError}
            />
          )}
        </section>
      </main>
    </div>
  )
}

export default Auth
