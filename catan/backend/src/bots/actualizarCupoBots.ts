import type { CatanRoom } from "../rooms/CatanRoom.js";
import { MAX_JUGADORES } from "../rooms/configuracion/limitesSala.js";

export function actualizarCupoBots(sala: CatanRoom): void {
    const bots = [...sala.jugadores.values()].filter((jugador) => jugador.esBot).length;

    sala.maxClients = MAX_JUGADORES - bots;
    sala.setMetadata({ ...sala.metadata, bots });
}
