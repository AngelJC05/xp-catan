import { MapSchema } from "@colyseus/schema";
import type { Client } from "colyseus";
import type { CatanRoom } from "../../src/rooms/CatanRoom.js";
import { Jugador } from "../../src/schemas/Jugador.js";
import { Partida } from "../../src/schemas/Partida.js";

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

//? Funcion que devuelve una sala falsa que guarda todo lo que se difunde
export function armarSala(nombresPorId: Record<string, string> = {}) {
  const difundidos: Envio[] = [];
  const partida = new Partida();
  const jugadores = new MapSchema<Jugador>();
  for (const [sessionId, nombre] of Object.entries(nombresPorId)) {
    jugadores.set(sessionId, new Jugador(nombre));
  }
  const estado = { bloqueada: false };

  const sala = {
    partida,
    jugadores,
    metadata: {},
    broadcast: (tipo: string, mensaje: unknown) => difundidos.push({ tipo, mensaje }),
    setMetadata: (metadata: object) => { sala.metadata = metadata; },
    lock: () => { estado.bloqueada = true; }
  } as unknown as CatanRoom;
  
  return { sala, partida, jugadores, difundidos, estado };
}
