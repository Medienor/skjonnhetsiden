/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Add API response types if needed
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
