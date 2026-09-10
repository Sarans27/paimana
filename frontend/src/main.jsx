// src/main.jsx
// This is the ENTRY POINT of your React app.
// It takes your App component and puts it on screen.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'           // ← Import App from App.jsx

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)