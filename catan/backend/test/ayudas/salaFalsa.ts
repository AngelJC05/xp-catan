import type { Client } from "colyseus";
import type { CatanRoom } from "../../src/rooms/CatanRoom.js";
import { Jugador } from "../../src/schemas/Jugador.js";
import { CatanState } from "../../src/states/CatanState.js";

export interface Envio {
  tipo: string;
  mensaje: unknown;
}

//? Funcion que devuelve un cliente falso que guarda todo lo que se le envia
export function armarCliente(sessionId = "") {
  const enviados: Envio[] = [];
  
  const client = {
    sessionId,
    send: (tipo: string, mensaje: unknown) => enviados.push({ tipo, mensaje })
  } as unknown as Client;

  return { client, enviados };
}

/* 
  ? Funcion que devuelve una sala falsa con tablero y banca reales, 
  ? que guarda todo lo que se difunde y cuantas veces se revisa el camino mas largo
*/
export function armarSala(nombresPorId: Record<string, string> = {}) {
  const difundidos: Envio[] = [];
  const { partida, jugadores, tablero, banca } = new CatanState();
  const estado = { bloqueada: false, revisionesCamino: 0 };
  
  for (const [sessionId, nombre] of Object.entries(nombresPorId)) {
    jugadores.set(sessionId, new Jugador(nombre));
  }

  const sala = {
    partida,
    jugadores,
    tablero,
    banca,
    metadata: {},
    codigoAcceso: "",
    ofertas: new Map<string, unknown>(),
    broadcast: (tipo: string, mensaje: unknown) => difundidos.push({ tipo, mensaje }),
    setMetadata: (metadata: object) => { sala.metadata = metadata; },
    lock: () => { estado.bloqueada = true; },
    revisarCaminoMasLargo: () => { estado.revisionesCamino++; }
  } as unknown as CatanRoom;
  
  return { sala, partida, jugadores, tablero, banca, difundidos, estado };
}
