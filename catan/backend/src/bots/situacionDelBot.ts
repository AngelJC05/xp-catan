import type { CatanRoom } from "../rooms/CatanRoom.js";

//? Situaciones en las que un bot tiene algo que hacer
export type SituacionBot =
    | "asentamientoInicial"
    | "caminoInicial"
    | "dados"
    | "acciones"
    | "ladron"
    | "robo"
    | "descarte"
    | "carreteras"
    | "oferta";

//? Devuelve la situacion en la que esta el bot o null si ahora no le toca hacer nada
export function situacionDelBot(sala: CatanRoom, sessionId: string): SituacionBot | null {
    return null;
}
