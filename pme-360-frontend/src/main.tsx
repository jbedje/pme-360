import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppDebug from './AppDebug.tsx'

console.log('main.tsx loading - PME 360 starting...');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppDebug />
  </StrictMode>,
)
