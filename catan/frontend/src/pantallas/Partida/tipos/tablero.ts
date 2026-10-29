/* Coordenadas (h, d): h es la horizontal, positiva a la derecha; d es la
   diagonal, positiva hacia arriba a la derecha. */

// schemas/Coordenada.ts
export interface Coordenada {
  h: number;
  d: number;
}

// schemas/Hexagono.ts
export interface HexagonoDato {
  h: number;
  d: number;
  terreno: number;
  numero: number;
  /* true solo en el hexagono donde esta el ladron. El backend lo pone en el
     desierto al crear el tablero y lo actualiza cada vez que se mueve. */
  esLadron: boolean;
}

// schemas/Vertices.ts — "constuccion" va sin la r, asi esta en el backend.
export interface VerticeDato {
  h: number;
  d: number;
  p: number;
  constuccion: number;
  propietario: string;
}

// schemas/Arista.ts
export interface AristaDato {
  h: number;
  d: number;
  p: number;
  propietario: string;
}

// schemas/Puertos.ts — vertice1 y vertice2 son claves del mapa de vertices.
export interface PuertoDato {
  id: number;
  tipo: number;
  vertice1: string;
  vertice2: string;
}

// schemas/Tablero.ts
export interface DatosTablero {
  hexagonos: Record<string, HexagonoDato>;
  vertices: Record<string, VerticeDato>;
  aristas: Record<string, AristaDato>;
  puertos: Record<string, PuertoDato>;
  ladron: Coordenada;
}

/* Valores del enum Terreno de common/enums.ts. */
export const TERRENO = {
  DESIERTO: 0,
  MADERA: 1,
  TRIGO: 2,
  LANA: 3,
  LADRILLO: 4,
  MINERAL: 5,
} as const;

/* Valores del enum Construccion de common/enums.ts, para vertice.constuccion. */
export const CONSTRUCCION = {
  VACIO: 0,
  ASENTAMIENTO: 1,
  CIUDAD: 2,
  CAMINO: 3,
} as const;

/* Valores del enum TipoPuerto de common/enums.ts. El backend le dice MINERAL
   a lo que el diseño llama Piedra. */
export const TIPO_PUERTO = {
  GENERICO: 0,
  MADERA: 1,
  TRIGO: 2,
  LANA: 3,
  LADRILLO: 4,
  MINERAL: 5,
} as const;

export const NOMBRE_PUERTO: Record<number, string> = {
  0: '3:1',
  1: '2 Madera:1',
  2: '2 Trigo:1',
  3: '2 Lana:1',
  4: '2 Ladrillo:1',
  5: '2 Piedra:1',
};