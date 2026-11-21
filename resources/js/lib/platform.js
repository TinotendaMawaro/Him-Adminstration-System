/**
 * Members and partners use the mobile app only. The native build is the only one compiled with VITE_API_BASE (see .env.app),
 * so that is how the app tells itself apart from the website. The server double-checks via the X-HIM-Client header.
 */
export const IS_APP = Boolean(import.meta.env.VITE_API_BASE) || Boolean(window.Capacitor?.isNativePlatform?.());
export const APP_HEADER = { 'X-HIM-Client': 'app' };
export const DOWNLOAD_PATH = '/download';
