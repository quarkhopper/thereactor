import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css';
import App from './App.tsx'
import './MessageBus.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
