import type { Client } from "colyseus";
import type { CatanRoom } from "../../src/rooms/CatanRoom.js";
import { Jugador } from "../../src/schemas/Jugador.js";
import { CatanState } from "../../src/states/CatanState.js";
import { TIEMPOS_POR_DEFECTO } from "../../src/timers/tiempos.js";

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
  ? que guarda todo lo que se difunde, cuantas veces se revisa el camino mas largo y las esperas de reconexion
*/
export function armarSala(nombresPorId: Record<string, string> = {}) {
  const difundidos: Envio[] = [];
  const { partida, jugadores, tablero, banca } = new CatanState();
  const estado = {
    bloqueada: false,
    revisionesCamino: 0,
    relojesLimpiados: 0,
    reconexiones: [] as { sessionId: string, segundos: number }[]
  };
  
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
    temporizador: {
      limpiar: () => { estado.relojesLimpiados++; },
      programar: () => {},
      cancelar: () => {}
    },
    tiempos: { ...TIEMPOS_POR_DEFECTO },
    ofertas: new Map<string, unknown>(),
    broadcast: (tipo: string, mensaje: unknown) => difundidos.push({ tipo, mensaje }),
    setMetadata: (metadata: object) => { sala.metadata = metadata; },
    lock: () => { estado.bloqueada = true; },
    allowReconnection: (client: Client, segundos: number) => { estado.reconexiones.push({ sessionId: client.sessionId, segundos }); },
    revisarCaminoMasLargo: () => { estado.revisionesCamino++; }
  } as unknown as CatanRoom;
  
  return { sala, partida, jugadores, tablero, banca, difundidos, estado };
}
