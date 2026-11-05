import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FasePartida } from "../../../common/enums.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { enFasePartida, esCreador, validar } from "../../validaciones/guardias.js";
import { validarConfiguracion } from "../../configuracion/validarConfiguracion.js";

//? Atiende msgConfigurarSala: en el lobby el creador cambia los tiempos y los puntos para ganar
export function manejarConfigurarSala(
    sala: CatanRoom,
    client: Client,
    mensaje: Record<string, unknown>
): void {
    //* Solo el creador y solo mientras la partida no haya empezado
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [esCreador, enFasePartida(FasePartida.LOBBY)]
    );

    if (error) {
        enviarError(client, error);
        return;
    }

    //* Si algun valor no esta permitido se rechaza todo
    const resultado = validarConfiguracion(mensaje);

    if (resultado.error) {
        enviarError(client, resultado.mensaje);
        return;
    }
}
