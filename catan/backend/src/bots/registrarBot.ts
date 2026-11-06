import type { Client } from "colyseus";
import type { CatanRoom } from "../rooms/CatanRoom.js";

//? Registra un bot en la sala y devuelve su cliente falso
export function registrarBot(sala: CatanRoom): Client {
    return { sessionId: "", send: () => {} } as unknown as Client;
}
