import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DeskContextProvider } from './contexts/DeskContextProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <DeskContextProvider>
    <App />
  </DeskContextProvider>
)
