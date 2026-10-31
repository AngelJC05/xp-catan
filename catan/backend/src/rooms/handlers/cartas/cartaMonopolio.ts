import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { Desarrollo, FaseJuego } from "../../../common/enums.js";
import { jugarMonopolio } from "../../../functions/jugarMonopolio.js";
import { difundirSonido, enviarError, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
import { enFaseJuego, esSuTurno, partidaEnCurso, puedeUsarCarta, tieneCarta, validar } from "../../validaciones/guardias.js";

//? Atiende el mensaje msgCartaMonopolio: el jugador se queda con todo un recurso de los demas
export function manejarCartaMonopolio(
    sala: CatanRoom,
    client: Client,
    mensaje: { recurso: string }
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
            tieneCarta(Desarrollo.MONOPOLIO)
        ]
    );

    if (error || !jugador) {
        enviarError(client, error ?? "No se encontro al jugador");
        return;
    }

    //* Intentar jugar la carta de monopolio
    const resultado = jugarMonopolio(
        sala.jugadores,
        client.sessionId,
        mensaje.recurso
    );

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
        return;
    }

    registrarLogDeJugador(sala, client.sessionId, resultado.mensaje);
    difundirSonido(sala, "monopolio");

    //* Marcar que ya se uso una carta en este turno
    sala.partida.cartaJugable = false;
}
