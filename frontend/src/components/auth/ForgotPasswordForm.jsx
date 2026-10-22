import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Loader2, Mail, Send } from 'lucide-react'
import Field from './Field'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPasswordForm({ onSubmit, onGoToLogin, submitting, error }) {
  const [email, setEmail] = useState('')
  const [validationError, setValidationError] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleanEmail = email.trim()

    if (!cleanEmail) {
      setValidationError('Please enter your email address.')
      return
    }

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setValidationError('Please enter a valid email address.')
      return
    }

    setValidationError('')
    const ok = await onSubmit(cleanEmail.toLowerCase())
    if (ok !== false) {
      setSubmittedEmail(cleanEmail)
    }
  }

  return (
    <div>
      <span className="pill pill-green uppercase tracking-wide">Account Recovery</span>
      <h1 className="mt-5 text-4xl leading-tight">Forgot password?</h1>
      <p className="mt-3 text-sm text-muted">
        Enter the email address associated with your restaurant account. We will send you a secure link to reset your password.
      </p>

      {submittedEmail ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-brand/20 bg-brand/5 p-5 text-center">
            <CheckCircle2 size={36} className="mx-auto text-brand" />
            <h2 className="mt-3 font-semibold text-ink">Check your inbox</h2>
            <p className="mt-2 text-sm text-muted">
              If an account is associated with <strong className="text-ink">{submittedEmail}</strong>,
              we have sent instructions and a link to reset your password.
            </p>
            <p className="mt-2 text-xs text-muted">⏳ The link is valid for 15 minutes.</p>
          </div>

          {/* Clear "Go to login/sign-in page" button */}
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={onGoToLogin}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Go to login/sign-in page
          </button>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          {error && (
            <p className="notice notice-red" role="alert">
              {error}
            </p>
          )}

          <Field id="forgot-email" label="Email address" error={validationError}>
            <div className="relative">
              <input
                id="forgot-email"
                type="email"
                className={`input ${validationError ? 'input-error' : ''}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (validationError) setValidationError('')
                }}
                placeholder="manager@restaurant.com"
                autoComplete="email"
                autoFocus
                aria-invalid={Boolean(validationError)}
                aria-describedby={validationError ? 'forgot-email-error' : undefined}
              />
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
                <Mail size={16} />
              </div>
            </div>
          </Field>

          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Send size={16} aria-hidden="true" />
            )}
            Send reset link
          </button>

          {/* Clear "Go to login/sign-in page" button */}
          <div className="mt-6 border-t border-line pt-6 text-center">
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={onGoToLogin}
            >
              <ArrowLeft size={15} />
              Go to login/sign-in page
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ForgotPasswordForm
