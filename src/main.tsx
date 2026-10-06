import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './services/offlineSyncService';

// Daftarkan Service Worker sederhana untuk offline caching dan background sync
registerServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);
