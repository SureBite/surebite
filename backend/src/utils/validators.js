import dns from 'dns/promises';

// Official Gmail username pattern: 6-30 characters, letters, numbers, non-consecutive dots, no leading/trailing dot
export const GMAIL_REGEX = /^(?![.])(?!.*[.]{2})[a-zA-Z0-9.]{6,30}(?<![.])@(gmail|googlemail)\.com$/i;

/**
 * Validates that Manager Name is more than 1 letter (min 2 characters)
 */
export const validateManagerName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, message: 'Manager name is required.' };
  }
  const cleanName = name.trim();
  if (cleanName.length < 2) {
    return { isValid: false, message: 'Manager name must be more than 1 letter.' };
  }
  return { isValid: true };
};

/**
 * Validates that Restaurant Name is more than 1 letter (min 2 characters)
 */
export const validateRestaurantName = (restaurantName) => {
  if (!restaurantName || typeof restaurantName !== 'string') {
    return { isValid: false, message: 'Restaurant name is required.' };
  }
  const cleanName = restaurantName.trim();
  if (cleanName.length < 2) {
    return { isValid: false, message: 'Restaurant name must be more than 1 letter.' };
  }
  return { isValid: true };
};

/**
 * Validates that an email is an authentic Gmail address with Google MX servers
 */
export const validateGmailAuthentic = async (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email address is required.' };
  }

  const cleanEmail = email.trim().toLowerCase();

  // Check domain
  if (!cleanEmail.endsWith('@gmail.com') && !cleanEmail.endsWith('@googlemail.com')) {
    return {
      isValid: false,
      message: 'Only authentic Gmail addresses (@gmail.com) are accepted.',
    };
  }

  // Check username structure (6-30 alphanumeric + non-consecutive dots)
  const username = cleanEmail.split('@')[0];
  if (username.length < 6 || username.length > 30) {
    return {
      isValid: false,
      message: 'Gmail username must be between 6 and 30 characters long.',
    };
  }

  if (!GMAIL_REGEX.test(cleanEmail)) {
    return {
      isValid: false,
      message: 'Invalid Gmail address format. Usernames can only contain letters, numbers, and periods (no consecutive periods, and cannot start or end with a period).',
    };
  }

  // DNS MX verification: verify domain points to Google mail exchangers
  try {
    const domain = cleanEmail.split('@')[1];
    const mxRecords = await dns.resolveMx(domain);
    const isAuthenticGoogle =
      Array.isArray(mxRecords) &&
      mxRecords.length > 0 &&
      mxRecords.some(
        (record) =>
          record.exchange.toLowerCase().includes('google.com') ||
          record.exchange.toLowerCase().includes('googlemail.com')
      );

    if (!isAuthenticGoogle) {
      return {
        isValid: false,
        message: 'Email domain failed Google MX authenticity verification.',
      };
    }
  } catch (error) {
    // If running offline or in restricted environment, do not block if regex passed
    console.warn(`[DNS MX verification note for ${cleanEmail}]:`, error.message);
  }

  return { isValid: true, email: cleanEmail };
};

/**
 * Validates password strength: requires uppercase, lowercase, numbers, and min 8 characters
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required.' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);

  if (!hasUppercase || !hasLowercase || !hasDigit) {
    return {
      isValid: false,
      message: 'Password must contain uppercase letters, lowercase letters, and numbers.',
    };
  }

  return { isValid: true };
};
