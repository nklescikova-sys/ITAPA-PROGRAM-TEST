import { useEffect, useState } from 'react';
import { stopSpeaking } from './speech';

/** Hash routing (#/pismeno/a) – funguje na statickom hostingu bez nastavení servera. */
export function currentPath(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h || '/';
}

export function navigate(path: string) {
  stopSpeaking(); // pri prechode na inú obrazovku stíšime predchádzajúci hlas
  window.location.hash = path;
}

export function useRoute(): string {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const on = () => setPath(currentPath());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}
