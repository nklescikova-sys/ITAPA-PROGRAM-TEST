import QRCode from 'qrcode';

/** Adresa, z ktorej sa generujú QR kódy (VITE_BASE_URL, inak aktuálna adresa). */
export function baseUrl(): string {
  const env = import.meta.env.VITE_BASE_URL as string | undefined;
  if (env) return env.endsWith('/') ? env : env + '/';
  return window.location.origin + window.location.pathname;
}

export const letterUrl = (base: string, id: string) => `${base}#/pismeno/${id}`;

const OPTS = { margin: 2, width: 512, color: { dark: '#000000', light: '#ffffff' } };

export async function qrPng(url: string): Promise<string> {
  return QRCode.toDataURL(url, OPTS);
}
export async function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, { ...OPTS, type: 'svg' });
}
