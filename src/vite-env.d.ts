/// <reference types="vite/client" />

declare const __DEEPSEEK_API_KEY__: string;

interface ImportMetaEnv {
  readonly VITE_DEEPSEEK_API_KEY?: string;
  readonly deep_Seek_api_key?: string;
  readonly DEEPSEEK_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
