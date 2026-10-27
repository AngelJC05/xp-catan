import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { Desarrollo, FaseJuego } from "../../../common/enums.js";
import { jugarAbundancia } from "../../../functions/jugarAbundancia.js";
import { difundirSonido, enviarError, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, esSuTurno, partidaEnCurso, puedeUsarCarta, tieneCarta, validar } from "../../validaciones/guardias.js";

//? Atiende el mensaje msgCartaAbundancia: el jugador toma dos recursos de la banca con la carta
export function manejarCartaAbundancia(
    sala: CatanRoom,
    client: Client,
    mensaje: { recurso1: string, recurso2: string }
): void {
    //* Obtiene al jugador que envio el mensaje 
    const jugador = sala.jugadores.get(client.sessionId);

    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId, jugador },
        [
            partidaEnCurso,
            esSuTurno,
            enFaseJuego(FaseJuego.ACCIONES),
            puedeUsarCarta,
            tieneCarta(Desarrollo.ABUNDANCIA)
        ]
    );

    if (error || !jugador) {
        enviarError(client, error ?? "No se encontro al jugador");
        return;
    }

    //* Intentar jugar la carta de abundancia
    const resultado = jugarAbundancia(
        jugador,
        sala.banca,
        mensaje.recurso1,
        mensaje.recurso2
    );

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
        return;
    }

    registrarLogDeJugador(sala, client.sessionId, resultado.mensaje);
    difundirSonido(sala, "abundancia");

    //* Marcar que ya se uso una carta en este turno
    sala.partida.cartaJugable = false;
}
