import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import Field from './Field'
import {
  validateManagerName,
  validateRestaurantName,
  validateGmail,
  validatePassword,
} from '../../utils/validators'

export function RegisterForm({ onSubmit, onSwitchToLogin, submitting, error }) {
  const [values, setValues] = useState({
    name: '',
    restaurantName: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    // 1. Manager name must be more than 4 letters
    const nameErr = validateManagerName(values.name)
    if (nameErr) newErrors.name = nameErr

    // 2. Restaurant name must be more than 4 letters
    const restErr = validateRestaurantName(values.restaurantName)
    if (restErr) newErrors.restaurantName = restErr

    // 3. Email must be an authentic Gmail address
    const emailErr = validateGmail(values.email)
    if (emailErr) newErrors.email = emailErr

    // 4. Password must contain uppercase, lowercase, numbers (min 8 chars)
    const passErr = validatePassword(values.password, true)
    if (passErr) newErrors.password = passErr

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    onSubmit({
      name: values.name.trim(),
      restaurantName: values.restaurantName.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
    })
  }

  const inputClass = (field) => `input ${errors[field] ? 'input-error' : ''}`

  return (
    <div>
      <span className="pill pill-green uppercase tracking-wide">Let’s bring your menu online</span>
      <h1 className="mt-5 text-4xl leading-tight">A warmer welcome starts here.</h1>
      <p className="mt-3 text-sm text-muted">
        Create your restaurant manager account. We'll send a 6-digit verification code to your Gmail.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        {error && (
          <p className="notice notice-red" role="alert">
            {error}
          </p>
        )}

        <Field
          id="name"
          label="Manager name"
          error={errors.name}
          hint="Must be more than 1 letter (min 2 characters)."
        >
          <input
            id="name"
            className={inputClass('name')}
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            autoComplete="name"
            placeholder="e.g. Rahul Sharma"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
        </Field>

        <Field
          id="restaurantName"
          label="Restaurant name"
          error={errors.restaurantName}
          hint="Must be more than 1 letter (min 2 characters)."
        >
          <input
            id="restaurantName"
            className={inputClass('restaurantName')}
            value={values.restaurantName}
            onChange={(e) => handleChange('restaurantName', e.target.value)}
            autoComplete="organization"
            placeholder="e.g. Spice Garden Bistro"
            aria-invalid={Boolean(errors.restaurantName)}
            aria-describedby={errors.restaurantName ? 'restaurantName-error' : undefined}
          />
        </Field>

        <Field
          id="email"
          label="Gmail address"
          error={errors.email}
          hint="Must be an authentic Gmail address (@gmail.com)."
        >
          <input
            id="email"
            type="email"
            className={inputClass('email')}
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            autoComplete="email"
            placeholder="manager@gmail.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </Field>

        <Field
          id="password"
          label="Password"
          error={errors.password}
          hint="Must contain uppercase (A-Z), lowercase (a-z), numbers (0-9), and at least 8 characters."
        >
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`${inputClass('password')} pr-11`}
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
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

        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight size={16} aria-hidden="true" />
          )}
          Create account
        </button>
      </form>

      <div className="mt-6 border-t border-line pt-6 text-center">
        <p className="text-sm text-muted">
          Already have an account?{' '}
          <button
            type="button"
            className="font-semibold text-ink hover:text-brand"
            onClick={onSwitchToLogin}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm
