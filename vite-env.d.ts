
declare module '*.css';
declare module '*.png';
declare module '*.svg';
declare module '*.jpeg';
declare module '*.jpg';

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_RECAPTCHA_SITE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Wildcard declaration to solve "Cannot find module" error immediately
declare module '@google/genai';

// Fix for react-router-dom missing types error
declare module 'react-router-dom';
