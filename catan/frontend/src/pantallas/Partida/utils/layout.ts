export const FONDO_PARTIDA = '#C5CFD6';
export const GRILLA = {
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr)) repeat(2, clamp(140px, 13vw, 210px))',
  gridTemplateRows: 'auto auto minmax(0, 1fr) clamp(160px, 24vh, 240px)',
  gap: 5,
  backgroundColor: FONDO_PARTIDA,
} as const;

// Lugar de cada panel: fila inicial / columna inicial / fila final / columna final
export const AREA = {
  tablero: '1 / 1 / 4 / 6',
  salir: '1 / 1 / 2 / 2',
  infoJugadores: '1 / 6 / 2 / 8',
  existencias: '2 / 6 / 3 / 7',
  tabCostos: '2 / 7 / 3 / 8',
  chat: '3 / 6 / 5 / 8',
  carRecursos: '4 / 1 / 5 / 2',
  carDesarrollo: '4 / 2 / 5 / 3',
  construir: '4 / 3 / 5 / 4',
  negociar: '4 / 4 / 5 / 6',
} as const;

export const PANEL = 'overflow-hidden bg-white rounded-3';
