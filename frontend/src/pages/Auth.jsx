import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { USE_MOCK, getErrorMessage } from '../api/api'
import { DEMO_ACCOUNT } from '../api/mockApi'
import { Logo } from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values, isRegister) {
  const errors = {}
  if (isRegister && !values.name.trim()) errors.name = 'Enter your name.'
  if (isRegister && !values.restaurantName.trim()) errors.restaurantName = 'Enter your restaurant’s name.'
  if (!values.email.trim()) errors.email = 'Enter your email address.'
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email address, like name@restaurant.com.'
  if (!values.password) errors.password = 'Enter your password.'
  else if (isRegister && values.password.length < 8) errors.password = 'Use at least 8 characters.'
  return errors
}

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger-text">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>
      )}
    </div>
  )
}

function Auth() {
  const { user, loading, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const isRegister = searchParams.get('mode') === 'register'

  const [values, setValues] = useState({ name: '', restaurantName: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const destination = location.state?.from || '/dashboard'

  if (!loading && user) return <Navigate to={destination} replace />

  function setField(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }))
  }

  function switchMode(mode) {
    setErrors({})
    setFormError('')
    setSearchParams(mode === 'register' ? { mode: 'register' } : {}, { state: location.state, replace: true })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const found = validate(values, isRegister)
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      const email = values.email.trim().toLowerCase()
      if (isRegister) {
        await register({
          name: values.name.trim(),
          email,
          password: values.password,
          restaurantName: values.restaurantName.trim(),
        })
      } else {
        await login({ email, password: values.password })
      }
      navigate(destination, { replace: true })
    } catch (error) {
      setFormError(getErrorMessage(error))
      setSubmitting(false)
    }
  }

  const inputClass = (name) => `input ${errors[name] ? 'input-error' : ''}`
  const describe = (name) => (errors[name] ? { 'aria-invalid': true, 'aria-describedby': `${name}-error` } : {})

  return (
    <div className="min-h-screen bg-cream">
      <header className="page flex items-center justify-between py-6">
        <Logo />
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} aria-hidden="true" /> Back to home
        </Link>
      </header>

      <main className="page grid gap-10 pb-16 lg:grid-cols-2 lg:gap-16">
        <aside className="hidden flex-col rounded-3xl bg-brand p-9 text-white lg:flex">
          <span className="pill self-start bg-white uppercase tracking-wide text-brand">Made for restaurants</span>
          <p className="mt-8 font-serif text-4xl leading-tight">
            A thoughtful menu.
            <br />A warmer welcome.
          </p>
          <p className="mt-5 max-w-md text-sm text-white/85">
            Bring your paper menu online, with allergen information checked by the people who know your kitchen.
          </p>
          <img
            src="/images/food-table.jpg"
            alt="Bowls of chana masala and dal on a restaurant table"
            className="mt-8 min-h-[12rem] w-full flex-1 rounded-2xl object-cover"
          />
          <div className="mt-8 border-t border-white/30 pt-6">
            <p className="font-semibold">AI Infers. Humans Verify. Diners Stay Safe.</p>
            <p className="mt-3 text-xs text-white/80">Only staff-verified, published menus reach your guests.</p>
          </div>
        </aside>

        <section className="mx-auto w-full max-w-md self-center">
          <span className="pill pill-green uppercase tracking-wide">
            {isRegister ? 'Let’s bring your menu online' : 'Restaurant workspace'}
          </span>
          <h1 className="mt-5 text-4xl leading-tight">{isRegister ? 'A warmer welcome starts here.' : 'Welcome back.'}</h1>
          <p className="mt-3 text-sm text-muted">
            {isRegister ? 'Create your restaurant manager account.' : 'Sign in to review your menus and keep your guests informed.'}
          </p>

          {USE_MOCK && !isRegister && (
            <p className="notice notice-amber mt-5 block text-xs">
              Demo mode. Sign in with <strong>{DEMO_ACCOUNT.email}</strong> and password <strong>{DEMO_ACCOUNT.password}</strong>, or
              create an account.
            </p>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
            {formError && (
              <p className="notice notice-red" role="alert">
                {formError}
              </p>
            )}

            {isRegister && (
              <>
                <Field id="name" label="Manager name" error={errors.name}>
                  <input
                    id="name"
                    className={inputClass('name')}
                    value={values.name}
                    onChange={(event) => setField('name', event.target.value)}
                    autoComplete="name"
                    {...describe('name')}
                  />
                </Field>
                <Field id="restaurantName" label="Restaurant name" error={errors.restaurantName}>
                  <input
                    id="restaurantName"
                    className={inputClass('restaurantName')}
                    value={values.restaurantName}
                    onChange={(event) => setField('restaurantName', event.target.value)}
                    autoComplete="organization"
                    {...describe('restaurantName')}
                  />
                </Field>
              </>
            )}

            <Field id="email" label="Email address" error={errors.email}>
              <input
                id="email"
                type="email"
                className={inputClass('email')}
                value={values.email}
                onChange={(event) => setField('email', event.target.value)}
                autoComplete="email"
                {...describe('email')}
              />
            </Field>

            <Field
              id="password"
              label="Password"
              error={errors.password}
              hint={isRegister ? 'Choose a strong password for your restaurant workspace.' : ''}
            >
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`${inputClass('password')} pr-11`}
                  value={values.password}
                  onChange={(event) => setField('password', event.target.value)}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  {...describe('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink"
                  onClick={() => setShowPassword((shown) => !shown)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
              {isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 border-t border-line pt-6 text-center">
            {isRegister ? (
              <p className="text-sm text-muted">
                Already have an account?{' '}
                <button type="button" className="font-semibold text-ink hover:text-brand" onClick={() => switchMode('login')}>
                  Sign in
                </button>
              </p>
            ) : (
              <>
                <p className="text-sm text-muted">New to SureBite?</p>
                <button type="button" className="btn btn-secondary mt-3 w-full" onClick={() => switchMode('register')}>
                  Create restaurant account
                </button>
                <p className="mt-6 text-xs text-muted">
                  Here to browse a menu? Scan the restaurant’s QR code — no sign-in needed.
                </p>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Auth
