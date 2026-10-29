import type { Banca } from '../pantallas/Partida/tipos/banca';

export const bancaPrueba: Banca = {
  // Al inicio son 19 de cada uno;
  recursos: { madera: 14, trigo: 16, lana: 15, ladrillo: 13, mineral: 17 },
  /* 21 cartas de las 25 del mazo original:
     1 caballero, 2 punto de victoria, 3 carreteras, 4 abundancia, 5 monopolio */
  cartas: [1, 2, 1, 3, 1, 1, 1, 2, 1, 5, 1, 4, 1, 1, 3, 1, 2, 1, 1, 4, 1],
};