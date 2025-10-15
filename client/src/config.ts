const CONFIG_KEYS = {
  GOOGLE_AUTH_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string,
  REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI as string,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  CLOUDFRONT_BASE: import.meta.env.VITE_CLOUDFRONT_BASE || "",
};
export default CONFIG_KEYS;
