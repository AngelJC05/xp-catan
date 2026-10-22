/* ============== COLORES DE JUGADOR =========================
   Copia de backend/src/common/enums.ts (ColorJugador). El backend solo manda
   el numero; aqui se decide el tono exacto de cada uno. El orden de los ids
   debe seguir siendo el del enum. */

export const COLOR = {
  SIN_COLOR: 0,
  AZUL: 1,
  ROJO: 2,
  VERDE: 3,
  AMARILLO: 4,
  ANARANJADO: 5,
  CAFE: 6,
  MORADO: 7,
  ROSA: 8,
  CELESTE: 9,
  NEGRO: 10,
} as const;

// Tonos propuestos para cada color
export const HEX_COLOR: Record<number, string> = {
  [COLOR.SIN_COLOR]: '#9E9E9E',
  [COLOR.AZUL]: '#1565C0',
  [COLOR.ROJO]: '#C62828',
  [COLOR.VERDE]: '#2E7D32',
  [COLOR.AMARILLO]: '#faba54',
  [COLOR.ANARANJADO]: '#f76e06',
  [COLOR.CAFE]: '#ac7664',
  [COLOR.MORADO]: '#6A1B9A',
  [COLOR.ROSA]: '#C2185B',
  [COLOR.CELESTE]: '#4FC3F7',
  [COLOR.NEGRO]: '#080808',
};

// Si llega un numero que no existe se muestra como sin color.
export function hexDeColor(color: number): string {
  return HEX_COLOR[color] ?? HEX_COLOR[COLOR.SIN_COLOR];
}

// Nombre para mostrar en la pantalla cada color
export const NOMBRE_COLOR: Record<number, string> = {
  [COLOR.SIN_COLOR]: 'Sin color',
  [COLOR.AZUL]: 'Azul',
  [COLOR.ROJO]: 'Rojo',
  [COLOR.VERDE]: 'Verde',
  [COLOR.AMARILLO]: 'Amarillo',
  [COLOR.ANARANJADO]: 'Anaranjado',
  [COLOR.CAFE]: 'Café',
  [COLOR.MORADO]: 'Morado',
  [COLOR.ROSA]: 'Rosa',
  [COLOR.CELESTE]: 'Celeste',
  [COLOR.NEGRO]: 'Negro',
}