/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly COHORT_XPS_ORIGIN_URL: string;
  readonly COHORT_AUTH_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
