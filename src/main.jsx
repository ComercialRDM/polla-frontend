import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
  })
}

// registerType: 'autoUpdate' (vite.config.js) activa el service worker nuevo
// solo (skipWaiting + clientsClaim), pero las pestañas YA abiertas antes del
// despliegue se quedan apuntando a archivos JS con hash viejo que el servidor
// ya no tiene -- eso es lo que causaba la pantalla en blanco justo despues de
// un deploy. Este listener fuerza un reload UNA sola vez cuando el nuevo
// service worker toma control, para que la pestaña siempre quede con los
// archivos correctos sin que el usuario tenga que borrar datos a mano.
registerSW({ immediate: true })

if ('serviceWorker' in navigator) {
  let yaRecargo = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (yaRecargo) return
    yaRecargo = true
    window.location.reload()
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
