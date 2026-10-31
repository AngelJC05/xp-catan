import type { Cartas, ConstruccionesDisponibles, Recurso } from './jugador';

export const ICONO_RECURSO: Record<Recurso, string> = {
  madera: '/svg/recursos/madera.svg',
  trigo: '/svg/recursos/trigo.svg',
  lana: '/svg/recursos/lana.svg',
  ladrillo: '/svg/recursos/ladrillo.svg',
  mineral: '/svg/recursos/piedra.svg',
};

// Los recursos en general, por ejemplo para contar cuántos tiene un jugador.
export const ICONO_RECURSOS = '/svg/recursos/todos.svg';

export const ICONO_CARTA: Record<keyof Cartas, string> = {
  '1': '/svg/cartas/caballero.svg',
  '2': '/svg/cartas/puntosVictoria.svg',
  '3': '/svg/cartas/carreteras.svg',
  '4': '/svg/cartas/abundancia.svg',
  '5': '/svg/cartas/monopolio.svg',
};

export const ICONO_CARTA_DESARROLLO = '/svg/cartas/desarrollo.svg';

export const ICONO_PIEZA: Record<keyof ConstruccionesDisponibles, string> = {
  '1': '/svg/piezas/asentamiento.svg',
  '2': '/svg/piezas/ciudad.svg',
  '3': '/svg/piezas/camino.svg',
};

export const ICONO_UI = {
  privada: '/svg/ui/privada.svg',
  publica: '/svg/ui/publica.svg',
  llave: '/svg/ui/llave.svg',
  martillo: '/svg/ui/martillo.svg',
  iniciarPartida: '/svg/ui/iniciarPartida.svg',
  espera: '/svg/ui/espera.svg',
  copiar: '/svg/ui/copiar.svg',
  copiado: '/svg/ui/copiado.svg',
  aceptarOferta: '/svg/ui/aceptarOferta.svg',
  rechazarOferta: '/svg/ui/rechazarOferta.svg',
  trofeo: '/svg/ui/trofeo.svg',
  adelante: '/svg/ui/adelante.svg',
  atras: '/svg/ui/atras.svg',
} as const;
