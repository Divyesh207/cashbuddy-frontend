
// Helper to access env vars safely without crashing if import.meta is not typed or available
const getEnv = (key: string, defaultValue: string): string => {
  try {
    // @ts-ignore: Suppress potential TS error if vite/client types are missing
    if (import.meta && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key] || defaultValue;
    }
  } catch (e) {
    // Fallback for environments where import.meta might throw
    console.warn("Error accessing environment variable:", key);
  }
  return defaultValue;
};

export const API_URL = getEnv("VITE_API_URL", "http://localhost:8000");

// REPLACE WITH YOUR ACTUAL GOOGLE RECAPTCHA V2 SITE KEY FROM ENV
export const RECAPTCHA_SITE_KEY = getEnv("VITE_RECAPTCHA_SITE_KEY", "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI");

export const GEMINI_API_KEY = getEnv("VITE_GEMINI_API_KEY", "");
