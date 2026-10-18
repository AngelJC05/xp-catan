import type { Jugadores } from '../common/jugador';

// DATOS DE PRUEBA

// Los sessionId son inventados.
export const miSessionIdPrueba = 'zNEakYdRU';

export const jugadoresPrueba: Jugadores = {
  zNEakYdRU: {
    nombre: 'jenjel',
    puntuacion: 4,
    puntosParaGanar: 10,
    recursos: { madera: 2, trigo: 1, lana: 0, ladrillo: 3, mineral: 0 },
    cartas_usables: { '1': 1, '2': 1, '3': 0, '4': 0, '5': 0 },
    cartas_inusables: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    construccionesDisponibles: { '1': 3, '2': 4, '3': 11 },
    ultimoAsentamiento: '0,0,0',
    caballerosJugados: 2,
    longitudCamino: 3,
  },
  aB7kLm2Qx: {
    nombre: 'coca',
    puntuacion: 3,
    puntosParaGanar: 10,
    recursos: { madera: 1, trigo: 2, lana: 1, ladrillo: 0, mineral: 1 },
    cartas_usables: { '1': 0, '2': 0, '3': 1, '4': 0, '5': 0 },
    // Compro un caballero este turno: todavia no lo puede jugar.
    cartas_inusables: { '1': 1, '2': 0, '3': 0, '4': 0, '5': 0 },
    construccionesDisponibles: { '1': 4, '2': 4, '3': 13 },
    ultimoAsentamiento: '-1,1,1',
    caballerosJugados: 0,
    longitudCamino: 6,
  },
  Rv9TpZo4c: {
    nombre: 'jair',
    puntuacion: 2,
    puntosParaGanar: 10,
    // Nueve recursos: si sale un 7 tiene que descartar.
    recursos: { madera: 3, trigo: 2, lana: 2, ladrillo: 1, mineral: 1 },
    cartas_usables: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    cartas_inusables: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    construccionesDisponibles: { '1': 4, '2': 4, '3': 14 },
    ultimoAsentamiento: '2,-1,0',
    caballerosJugados: 0,
    longitudCamino: 2,
  },
  Wq3sYh8Nd: {
    nombre: 'elayas',
    puntuacion: 5,
    puntosParaGanar: 10,
    recursos: { madera: 0, trigo: 1, lana: 1, ladrillo: 0, mineral: 1 },
    cartas_usables: { '1': 3, '2': 0, '3': 0, '4': 1, '5': 0 },
    cartas_inusables: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    construccionesDisponibles: { '1': 2, '2': 3, '3': 9 },
    ultimoAsentamiento: '1,-2,1',
    caballerosJugados: 3,
    longitudCamino: 4,
  },
};

/* Estos cuatro NO son del jugador: viven en state.partida. Estan aqui solo
   para poder probar la fila sin depender de otro archivo, y se llaman igual
   que en la guia para que al conectar sea cambiar el valor y nada mas. */
export const ordenJugadoresPrueba: string[] = [
  'zNEakYdRU', 'aB7kLm2Qx', 'Rv9TpZo4c', 'Wq3sYh8Nd',
];
export const turnoActualPrueba = 'aB7kLm2Qx';