import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import and define PWA elements for camera support on web
import { defineCustomElements } from '@ionic/pwa-elements/loader';
defineCustomElements(window);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);