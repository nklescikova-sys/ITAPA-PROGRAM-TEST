import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// písmo Baloo 2 je uložené lokálne (latinka + latinka s diakritikou pre slovenčinu)
import '@fontsource/baloo-2/latin-400.css';
import '@fontsource/baloo-2/latin-ext-400.css';
import '@fontsource/baloo-2/latin-600.css';
import '@fontsource/baloo-2/latin-ext-600.css';
import '@fontsource/baloo-2/latin-800.css';
import '@fontsource/baloo-2/latin-ext-800.css';
import './styles.css';
import { App } from './App';
import { StoreProvider } from './lib/store';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);
