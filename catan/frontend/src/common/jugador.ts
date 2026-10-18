export type Recurso = 'madera' | 'trigo' | 'lana' | 'ladrillo' | 'mineral';

export interface Recursos {
  madera: number;
  trigo: number;
  lana: number;
  ladrillo: number;
  mineral: number;
}

// Para recorrerlos en pantalla en un orden fijo.
export const RECURSOS: Recurso[] = ['madera', 'trigo', 'lana', 'ladrillo', 'mineral'];


/* ============= CARTAS DE DESARROLLO =========================
   El backend las guarda en DOS mapas, cartas_usables y cartas_inusables. Las
   claves son el enum CartasDesarrollo y van entre comillas porque las claves de
   un MapSchema siempre llegan como texto. */

export const CARTA = {
  CABALLERO: '1',
  PUNTOS_VICTORIA: '2',
  CARRETERAS: '3',
  ABUNDANCIA: '4',
  MONOPOLIO: '5',
} as const;

export interface Cartas {
  '1': number;   // caballero
  '2': number;   // punto de victoria
  '3': number;   // carreteras
  '4': number;   // abundancia
  '5': number;   // monopolio
}

export const NOMBRE_CARTA: Record<string, string> = {
  '1': 'Caballero',
  '2': 'Punto de victoria',
  '3': 'Carreteras',
  '4': 'Abundancia',
  '5': 'Monopolio',
};


/* ============== CONSTRUCCIONES DISPONIBLES =========================
   generarConstruccionesDisponibles.ts: 5 asentamientos, 4 ciudades, 15 caminos.
   Las claves son el enum Construccion, sin el 0 (VACIO). */

export const PIEZA = {
  ASENTAMIENTO: '1',
  CIUDAD: '2',
  CAMINO: '3',
} as const;

export interface ConstruccionesDisponibles {
  '1': number;   // asentamientos
  '2': number;   // ciudades
  '3': number;   // caminos
}

export const NOMBRE_PIEZA: Record<string, string> = {
  '1': 'Asentamiento',
  '2': 'Ciudad',
  '3': 'Camino',
};



/* =============== DATOS DEL JUGADOR =======================
   La clave del mapa es el sessionId que Colyseus le asigna a cada cliente.
   Los diez campos son copia literal de backend/src/schemas/Jugador.ts. Lo
   unico que el backend NO manda es el color: se calcula abajo. */

export interface Jugador {
  nombre: string;
  puntuacion: number;
  puntosParaGanar: number;
  recursos: Recursos;
  cartas_usables: Cartas;
  cartas_inusables: Cartas;
  construccionesDisponibles: ConstruccionesDisponibles;
  ultimoAsentamiento: string;
  caballerosJugados: number;
  longitudCamino: number;
}

/* Aqui SI va un Record de clave suelta, porque las claves son sessionId que no
   se conocen hasta que alguien entra a la sala. */
export type Jugadores = Record<string, Jugador>;


/* --------------------------------------------------------------- color
   El backend no manda color. Se asigna en el cliente por la posicion del
   jugador en el orden de turnos, que si publica: asi todos los jugadores ven
   el mismo color para la misma persona sin que nadie lo mande.
   Si algun dia el backend agrega el campo, se borra esto y se lee de ahi. */

export const COLORES = ['#D34F3E', '#3E7FD3', '#4CA36B', '#E0A030'];

export function colorDeJugador(ordenJugadores: string[], sessionId: string): string {
  const posicion = ordenJugadores.indexOf(sessionId);
  return COLORES[(posicion < 0 ? 0 : posicion) % COLORES.length];
}


/* cuentas
   No se guardan como campo. Si se guardaran habria que mantenerlas
   sincronizadas con los mapas y tarde o temprano mentirian. */

function sumar(mapa: Recursos | Cartas): number {
  return Object.values(mapa).reduce((total, n) => total + n, 0);
}

// Cartas de recurso en la mano. Es el numero que ven los rivales.
export function totalRecursos(jugador: Jugador): number {
  return sumar(jugador.recursos);
}

// Cartas de desarrollo en la mano, se puedan jugar ahora o no.
export function totalCartas(jugador: Jugador): number {
  return sumar(jugador.cartas_usables) + sumar(jugador.cartas_inusables);
}

// Todas las cartas en la mano: recursos mas desarrollo.
export function totalEnMano(jugador: Jugador): number {
  return totalRecursos(jugador) + totalCartas(jugador);
}

/* Con mas de 7 recursos, si sale un 7 hay que descartar la mitad. Esto es un
   aviso que damos nosotros ANTES de que pase; el descarte de verdad lo manda
   el backend en partida.jugadoresParaDescartar. */
export const LIMITE_DESCARTE = 7;

export function enRiesgoDeDescarte(jugador: Jugador): boolean {
  return totalRecursos(jugador) > LIMITE_DESCARTE;
}