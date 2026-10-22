// Official Gmail regex: 6 to 30 characters, alphanumeric and non-consecutive dots, no leading/trailing dot
export const GMAIL_REGEX = /^(?![.])(?!.*[.]{2})[a-zA-Z0-9.]{6,30}(?<![.])@(gmail|googlemail)\.com$/i;

/**
 * Validates Manager Name: must be more than 1 letter (min 2 characters)
 */
export function validateManagerName(name) {
  if (!name || !name.trim()) return 'Enter your name.';
  if (name.trim().length < 2) return 'Manager name must be more than 1 letter.';
  return '';
}

/**
 * Validates Restaurant Name: must be more than 1 letter (min 2 characters)
 */
export function validateRestaurantName(restaurantName) {
  if (!restaurantName || !restaurantName.trim()) return 'Enter your restaurant’s name.';
  if (restaurantName.trim().length < 2) return 'Restaurant name must be more than 1 letter.';
  return '';
}

/**
 * Validates whether email is an authentic Gmail address
 */
export function validateGmail(email) {
  if (!email || !email.trim()) return 'Enter your email address.';
  const clean = email.trim().toLowerCase();

  if (!clean.endsWith('@gmail.com') && !clean.endsWith('@googlemail.com')) {
    return 'Enter an authentic Gmail address ending with @gmail.com.';
  }

  const username = clean.split('@')[0];
  if (username.length < 6 || username.length > 30) {
    return 'Gmail username must be between 6 and 30 characters.';
  }

  if (!GMAIL_REGEX.test(clean)) {
    return 'Invalid Gmail format. Use letters, numbers, and non-consecutive periods.';
  }

  return '';
}

/**
 * Validates Password: must contain uppercase, lowercase, numbers, and at least 8 characters
 */
export function validatePassword(password, isStrict = true) {
  if (!password) return 'Enter your password.';
  if (!isStrict) return '';

  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter (a-z).';
  }
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number (0-9).';
  }

  return '';
}
