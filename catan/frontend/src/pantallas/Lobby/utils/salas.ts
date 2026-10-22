import type { RoomAvailable } from "@colyseus/sdk";

export type SalaTipo = "publica" | "privada";

export interface SalaDisponible {
  id: string;
  nombre: string;
  tipo: SalaTipo;
  jugadores: number;
  maxJugadores: number;
  anfitrion: string;
}

// Metadata que CatanRoom publica con setMetadata (ver onCreate en el backend).
export interface MetadataSala {
  alias?: string;
  estado?: string;
  privada?: boolean;
  anfitrion?: string;
}

export function salaDesdeListado(sala: RoomAvailable<MetadataSala>): SalaDisponible {
  return {
    id: sala.roomId,
    nombre: sala.metadata?.alias || "Catan Room",
    tipo: sala.metadata?.privada ? "privada" : "publica",
    jugadores: sala.clients,
    maxJugadores: sala.maxClients,
    anfitrion: sala.metadata?.anfitrion || "",
  };
}
