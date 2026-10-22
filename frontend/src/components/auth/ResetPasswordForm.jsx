import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import Field from './Field'
import { validatePassword } from '../../utils/validators'

export function ResetPasswordForm({ token, onSubmit, onGoToLogin, submitting, error }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    const passErr = validatePassword(password, true)
    if (passErr) {
      newErrors.password = passErr
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your new password.'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const ok = await onSubmit({ token, password })
    if (ok !== false) {
      setIsSuccess(true)
    }
  }

  if (isSuccess) {
    return (
      <div>
        <span className="pill pill-green uppercase tracking-wide">Success</span>
        <h1 className="mt-5 text-4xl leading-tight">Password updated.</h1>
        <p className="mt-3 text-sm text-muted">
          Your password has been reset successfully. You can now sign in to your restaurant workspace with your new password.
        </p>

        <div className="mt-8">
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={onGoToLogin}
          >
            <ArrowLeft size={16} />
            Go to login/sign-in page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <span className="pill pill-green uppercase tracking-wide">Password Reset</span>
      <h1 className="mt-5 text-4xl leading-tight">Create new password.</h1>
      <p className="mt-3 text-sm text-muted">
        Choose a secure password of at least 8 characters for your restaurant workspace.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        {error && (
          <p className="notice notice-red" role="alert">
            {error}
          </p>
        )}

        <Field
          id="new-password"
          label="New password"
          error={errors.password}
          hint="Must contain uppercase (A-Z), lowercase (a-z), numbers (0-9), and at least 8 characters."
        >
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              className={`input ${errors.password ? 'input-error' : ''} pr-11`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
              }}
              autoComplete="new-password"
              autoFocus
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'new-password-error' : undefined}
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

        <Field id="confirm-password" label="Confirm new password" error={errors.confirmPassword}>
          <div className="relative">
            <input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              className={`input ${errors.confirmPassword ? 'input-error' : ''} pr-11`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }))
              }}
              autoComplete="new-password"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            />
          </div>
        </Field>

        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <KeyRound size={16} aria-hidden="true" />
          )}
          Reset password
        </button>
      </form>

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
    </div>
  )
}

export default ResetPasswordForm
