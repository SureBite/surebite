const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: SEVEN_DAYS_MS,
  path: '/',
};

/**
 * Attaches the JWT token as a secure httpOnly cookie with 7-day expiration
 */
export const setAuthCookie = (res, token) => {
  res.cookie('token', token, COOKIE_OPTIONS);
};

/**
 * Clears the auth cookie on logout
 */
export const clearAuthCookie = (res) => {
  res.clearCookie('token', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
};
