import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

/* Design system: tokens first, then the reset/base layer, then materials. */
import './design/tokens.css';
import './design/base.css';
import './design/glass.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
