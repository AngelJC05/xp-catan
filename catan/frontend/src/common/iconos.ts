import type { Cartas, ConstruccionesDisponibles, Recurso } from './jugador';

export const ICONO_RECURSO: Record<Recurso, string> = {
  madera: '/svg/madera.svg',
  trigo: '/svg/trigo.svg',
  lana: '/svg/lana.svg',
  ladrillo: '/svg/ladrillo.svg',
  mineral: '/svg/piedra.svg',
};

export const ICONO_CARTA: Record<keyof Cartas, string> = {
  '1': '/svg/caballero.svg',
  '2': '/svg/puntosVictoria.svg',
  '3': '/svg/carreteras.svg',
  '4': '/svg/abundancia.svg',
  '5': '/svg/monopolio.svg',
};

export const ICONO_PIEZA: Record<keyof ConstruccionesDisponibles, string> = {
  '1': '/svg/poblado.svg',
  '2': '/svg/ciudad.svg',
  '3': '/svg/carretera.svg',
};

export const ICONO_CARTA_DESARROLLO = '/svg/desarrollo.svg';
