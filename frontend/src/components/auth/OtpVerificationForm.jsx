import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, RotateCcw } from 'lucide-react'
import Field from './Field'

export function OtpVerificationForm({ email, devOtp, onVerify, onResend, onBackToRegister, submitting, error }) {
  const [otp, setOtp] = useState('')
  const [validationError, setValidationError] = useState('')
  const [resending, setResending] = useState(false)
  const [resendStatus, setResendStatus] = useState('')
  const [countdown, setCountdown] = useState(60)

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleOtpChange = (e) => {
    // Only accept numeric input, max 6 digits
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(cleaned)
    if (validationError) setValidationError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setValidationError('Please enter the complete 6-digit verification code.')
      return
    }
    onVerify({ email, otp })
  }

  const handleResend = async () => {
    if (countdown > 0 || resending) return
    setResending(true)
    setResendStatus('')
    try {
      await onResend(email)
      setResendStatus('A new 6-digit code has been sent to your email.')
      setCountdown(60)
    } catch (err) {
      setValidationError(err?.message || 'Failed to resend code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div>
      <span className="pill pill-green uppercase tracking-wide">Verification</span>
      <h1 className="mt-5 text-4xl leading-tight">Verify your email.</h1>
      <p className="mt-3 text-sm text-muted">
        We sent a 6-digit verification code to <strong className="text-ink">{email}</strong>.
        Enter it below to activate your account.
      </p>

      {devOtp && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-950 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-900">⚠️ Render Free Tier Notice</span>
            <button
              type="button"
              className="rounded bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-950 hover:bg-amber-300 transition-colors cursor-pointer"
              onClick={() => {
                setOtp(devOtp)
                if (validationError) setValidationError('')
              }}
            >
              Auto-fill code
            </button>
          </div>
          <p className="mt-1 text-amber-800 leading-relaxed">
            Render free tier blocks SMTP email ports (465/587). For instant testing, your verification code is:
          </p>
          <div className="mt-2 font-mono text-xl font-bold tracking-widest text-amber-950">
            {devOtp}
          </div>
          <p className="mt-1.5 text-[11px] text-amber-700">
            (To receive real emails in your inbox on Render free tier, add a free <code>BREVO_API_KEY</code> in Render Environment Variables).
          </p>
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        {error && (
          <p className="notice notice-red" role="alert">
            {error}
          </p>
        )}

        {resendStatus && (
          <p className="notice notice-green flex items-center gap-2 text-xs" role="status">
            <CheckCircle2 size={15} />
            {resendStatus}
          </p>
        )}

        <Field
          id="otp"
          label="6-Digit Verification Code"
          error={validationError}
          hint="Code expires in 10 minutes."
        >
          <div className="relative">
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              placeholder="123456"
              className={`input text-center font-mono text-2xl tracking-[0.5em] ${validationError ? 'input-error' : ''}`}
              autoFocus
              autoComplete="one-time-code"
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? 'otp-error' : undefined}
            />
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
              <KeyRound size={18} />
            </div>
          </div>
        </Field>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={submitting || otp.length !== 6}
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 size={16} aria-hidden="true" />
          )}
          Verify code & activate
        </button>
      </form>

      <div className="mt-6 space-y-4 border-t border-line pt-6 text-center text-sm">
        <p className="text-muted">
          Didn’t get the email?{' '}
          {countdown > 0 ? (
            <span className="font-medium text-ink">Resend in {countdown}s</span>
          ) : (
            <button
              type="button"
              className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
              onClick={handleResend}
              disabled={resending}
            >
              <RotateCcw size={13} className={resending ? 'animate-spin' : ''} />
              {resending ? 'Sending…' : 'Resend code'}
            </button>
          )}
        </p>

        <div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink"
            onClick={onBackToRegister}
          >
            <ArrowLeft size={13} />
            Back to registration
          </button>
        </div>
      </div>
    </div>
  )
}

export default OtpVerificationForm
