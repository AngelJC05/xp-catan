import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FasePartida } from "../../../common/enums.js";
import { sacarJugador } from "../../../functions/sacarJugador.js";
import { actualizarRelojPreconstruccion } from "../../../autoFunctions/actualizarRelojPreconstruccion.js";
import { registrarLogDeJugador, registrarLogSistema } from "../../ayudantes/notificaciones.js";

//? Actualiza en la metadata de la sala el nombre del anfitrion segun el creador actual de la partida
function actualizarAnfitrion(sala: CatanRoom): void {
    sala.setMetadata({
        ...sala.metadata,
        anfitrion: sala.jugadores.get(sala.partida.creador)?.nombre ?? ""
    });
}

//? Salida en el lobby: solo se borra al jugador y, si era el creador, el siguiente en entrar pasa a ser el anfitrion
function salirDelLobby(sala: CatanRoom, sessionId: string): void {
    //* Sacamos al jugador que salio
    sala.jugadores.delete(sessionId);

    //* Borrar al jugador del orden de jugadores
    const indice = sala.partida.ordenJugadores.indexOf(sessionId);
    if (indice !== -1) {
        sala.partida.ordenJugadores.splice(indice, 1);
    }

    //* Si se fue el creador, el siguiente en entrar pasa a ser el anfitrion
    if (sala.partida.creador === sessionId) {
        sala.partida.creador = sala.partida.ordenJugadores[0] ?? "";
        actualizarAnfitrion(sala);
    }
}

//? Salida durante la partida: el jugador se elimina por completo y puede haber ganador por abandono
function salirDePartida(sala: CatanRoom, sessionId: string): void {
    //* Ver si era el creador de la sala
    const eraCreador = sala.partida.creador === sessionId;

    //* Ver si era su turno, para darle su reloj completo al siguiente
    const eraSuTurno = sala.partida.turnoActual === sessionId;

    //* Avisar del abandono antes de borrarlo, para tener su nombre
    registrarLogDeJugador(sala, sessionId, " ha abandonado la partida");

    sacarJugador(sala.partida, sala.tablero, sala.banca, sala.jugadores, sessionId);

    //* Por la eliminacion de sus construcciones el camino mas largo puede cambiar
    sala.revisarCaminoMasLargo();

    //* Actualizar el anfitrion si era el creador el que abandono
    if (eraCreador) {
        actualizarAnfitrion(sala);
    }

    //* Si cambio el turno o la preconstruccion termino, el reloj se reinicia o se cancela
    if (eraSuTurno || sala.partida.fase !== FasePartida.PRECONSTRUCCION) {
        actualizarRelojPreconstruccion(sala);
    }

    //* Si al sacarlo se gana avisar
    if (sala.partida.fase === FasePartida.FINALIZADA) {
        registrarLogSistema(sala, `${sala.jugadores.get(sala.partida.ganador)?.nombre} gana por abandono...`);
    }
}

//? Atiende la salida definitiva de un cliente (onLeave)
export function manejarSalida(sala: CatanRoom, client: Client): void {
    console.log(`${client.sessionId} left the room`);

    if (sala.partida.fase === FasePartida.LOBBY) {
        salirDelLobby(sala, client.sessionId);
        return;
    }

    salirDePartida(sala, client.sessionId);
}
