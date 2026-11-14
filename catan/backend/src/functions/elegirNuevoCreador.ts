import { ArraySchema, MapSchema } from "@colyseus/schema";
import { Jugador } from "../schemas/Jugador.js";

//? Devuelve al primero del orden que no sea un bot, o "" si solo quedan bots
export function elegirNuevoCreador(
    ordenJugadores: ArraySchema<string>, 
    jugadores: MapSchema<Jugador>)
: string {
    return ordenJugadores.find((id) => !jugadores.get(id)?.esBot) ?? "";
}
