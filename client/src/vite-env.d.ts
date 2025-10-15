/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_REDIRECT_URI: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_CLOUDFRONT_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}