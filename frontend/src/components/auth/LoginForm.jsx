import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { USE_MOCK } from '../../api/api'
import { DEMO_ACCOUNT } from '../../api/mockApi'
import Field from './Field'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginForm({ onSubmit, onSwitchToRegister, onForgotPassword, submitting, error }) {
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    const email = values.email.trim()

    if (!email) {
      newErrors.email = 'Enter your email address.'
    } else if (!EMAIL_PATTERN.test(email)) {
      newErrors.email = 'Enter a valid email address.'
    }

    if (!values.password) {
      newErrors.password = 'Enter your password.'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    onSubmit({ email: email.toLowerCase(), password: values.password })
  }

  const inputClass = (field) => `input ${errors[field] ? 'input-error' : ''}`

  return (
    <div>
      <span className="pill pill-green uppercase tracking-wide">Restaurant workspace</span>
      <h1 className="mt-5 text-4xl leading-tight">Welcome back.</h1>
      <p className="mt-3 text-sm text-muted">
        Sign in to review your menus and keep your guests informed.
      </p>

      {USE_MOCK && (
        <p className="notice notice-amber mt-5 block text-xs">
          Demo mode. Sign in with <strong>{DEMO_ACCOUNT.email}</strong> and password <strong>{DEMO_ACCOUNT.password}</strong>, or
          create an account.
        </p>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        {error && (
          <p className="notice notice-red" role="alert">
            {error}
          </p>
        )}

        <Field id="email" label="Email address" error={errors.email}>
          <input
            id="email"
            type="email"
            className={inputClass('email')}
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </Field>

        <Field id="password" label="Password" error={errors.password}>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`${inputClass('password')} pr-11`}
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <div className="flex justify-end">
          {onForgotPassword ? (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-medium text-brand hover:underline"
            >
              Forgot password?
            </button>
          ) : (
            <Link to="/forgot-password" className="text-xs font-medium text-brand hover:underline">
              Forgot password?
            </Link>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight size={16} aria-hidden="true" />
          )}
          Sign in
        </button>
      </form>

      <div className="mt-6 border-t border-line pt-6 text-center">
        <p className="text-sm text-muted">New to SureBite?</p>
        <button
          type="button"
          className="btn btn-secondary mt-3 w-full"
          onClick={onSwitchToRegister}
        >
          Create restaurant account
        </button>
        <p className="mt-6 text-xs text-muted">
          Here to browse a menu? Scan the restaurant’s QR code — no sign-in needed.
        </p>
      </div>
    </div>
  )
}

export default LoginForm
