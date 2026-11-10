/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Syncfusion license key, registered at startup. Empty string when none is set. */
  readonly VITE_SYNCFUSION_LICENSE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
