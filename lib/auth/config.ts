export const AUTH_COOKIE_NAME = "cac_session";
export const AUTH_MAX_AGE_SECONDS = 60 * 60 * 12;

export function getAuthConfig() {
  return {
    username: process.env.AUTH_ADMIN_USER || "",
    password: process.env.AUTH_ADMIN_PASSWORD || "",
    secret:
      process.env.AUTH_SECRET ||
      process.env.AUTH_ADMIN_PASSWORD ||
      "cac-poc-auth",
    cookieName: AUTH_COOKIE_NAME,
    maxAgeSeconds: AUTH_MAX_AGE_SECONDS,
  };
}

export function hasAuthCredentials() {
  const { username, password } = getAuthConfig();
  return Boolean(username && password);
}
