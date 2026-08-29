/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_READONLY: string
  readonly VITE_FAMILY_PASSWORD: string
  readonly VITE_API_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
