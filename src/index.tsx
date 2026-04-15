// ════════════════════════════════════════════════════════════
// FILE 1: src/index.tsx
//
// TEACH — This is the ONLY file that touches the real DOM.
// document.getElementById('root') grabs the <div id="root">
// from index.html. createRoot() tells React to own that div.
// .render() kicks off the entire React tree.
//
// StrictMode renders every component TWICE in development to
// help you catch side-effect bugs early. It does nothing in
// production build. Never remove it.
// ════════════════════════════════════════════════════════════
 
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// import "./globals.css"
import App from './App';
 
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
 
