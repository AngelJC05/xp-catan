import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { Desarrollo, FaseJuego } from "../../../common/enums.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { usarCartaAbundancia } from "../../acciones/cartas/usarCartaAbundancia.js";
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

    const resultado = usarCartaAbundancia(sala, client.sessionId, mensaje.recurso1, mensaje.recurso2);
    if (resultado.error) enviarError(client, resultado.mensaje);
}
