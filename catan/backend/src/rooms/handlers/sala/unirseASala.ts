import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { Jugador } from "../../../schemas/Jugador.js";
import { codigoAccesoValido, salaAbierta, validar } from "../../validaciones/guardias.js";

//? Datos que manda el cliente al unirse a la sala
export interface OpcionesUnirse {
    nombre?: string;
    codigoAcceso?: string;
}

//? Registra al jugador en la partida; aqui se agregaran los datos nuevos del jugador
function registrarJugador(sala: CatanRoom, sessionId: string, opciones: OpcionesUnirse): void {
    sala.partida.ordenJugadores.push(sessionId);
    sala.jugadores.set(sessionId, new Jugador(opciones.nombre));

    //* El primero en entrar es el creador de la sala
    if (sala.partida.creador === "") {
        sala.partida.creador = sessionId;
    }
}

//? Atiende la entrada de un cliente (onJoin)
export function manejarUnirse(
    sala: CatanRoom,
    client: Client,
    opciones: OpcionesUnirse
): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [salaAbierta, codigoAccesoValido(sala.codigoAcceso, opciones.codigoAcceso)]
    );

    if (error) throw new Error(error);

    console.log(`${client.sessionId} joined the room`);
    registrarJugador(sala, client.sessionId, opciones);
}
