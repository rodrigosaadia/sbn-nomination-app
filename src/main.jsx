import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../sbn-nomination-app.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
