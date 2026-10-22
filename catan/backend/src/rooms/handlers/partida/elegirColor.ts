import { Client } from "colyseus";
import { CatanRoom } from "../../CatanRoom.js";
import { enFasePartida, validar } from "../../validaciones/guardias.js";
import { FasePartida } from "../../../common/enums.js";
import { enviarError, registrarLogDeJugador } from "../../ayudantes/notificaciones.js";
import { elegirColor } from "../../../functions/elegirColor.js";

//? Atiende msgElegirColor: durante la fase de lobby el jugador elige color y se lo asigna si cumple condiciones
export function manejarElegirColor(
    sala: CatanRoom,
    client: Client,
    mensaje: { color: number }
): void {
    //* Obtener el jugador que envio el mensaje
    const jugador = sala.jugadores.get(client.sessionId);

    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [enFasePartida(FasePartida.LOBBY)]
    )

    if(error || !jugador){
        enviarError(client, error ?? "No se encontro al jugador");
        return;
    }

    //* Intentar asignar el color al jugador
    const resultado = elegirColor(
        sala.jugadores,
        client.sessionId,
        mensaje.color
    );
    
    if(resultado.error){
        enviarError(client, resultado.mensaje);
        return;
    }

    registrarLogDeJugador(sala, client.sessionId, resultado.mensaje);
}