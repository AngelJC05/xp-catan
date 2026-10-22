import { MapSchema } from "@colyseus/schema";
import { Jugador } from "../schemas/Jugador.js";
import { ColorJugador } from "../common/enums.js";


export function elegirColor(
    jugadores: MapSchema<Jugador>,
    sessionId: string,
    colorElegido: number
): {
    error: boolean,
    mensaje: string
}{
    throw new Error("Sin implementar");
}