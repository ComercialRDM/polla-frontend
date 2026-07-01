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

// Escuchar ANTES de registrar el SW para no perder el evento si activa rápido.
// controllerchange: el nuevo SW tomó control → recargar para servir JS/CSS frescos.
// visibilitychange: el usuario vuelve a la app (desde el switcher de iOS) →
//   forzar que el SW compruebe si hay una versión nueva disponible.
if ('serviceWorker' in navigator) {
  let yaRecargo = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (yaRecargo) return
    yaRecargo = true
    window.location.reload()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      navigator.serviceWorker.ready.then((reg) => reg.update()).catch(() => {})
    }
  })
}

registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
