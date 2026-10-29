import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Bootstrap va primero para que el CSS propio pueda ajustarlo.
import 'bootstrap/dist/css/bootstrap.min.css'
// Tema de las pantallas previas a la partida. Va antes que App para que el
// CSS de cada pantalla (que se carga después) pueda ajustarlo.
import './estilos/tema.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
