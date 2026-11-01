import type { Client } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";
import { FasePartida } from "../../../common/enums.js";
import { mezclar } from "../../../common/mezclar.js";
import { enviarError } from "../../ayudantes/notificaciones.js";
import { enFasePartida, esCreador, validar } from "../../validaciones/guardias.js";
import { completarColores } from "../../../functions/completarColores.js";
import { iniciarRelojPreconstruccion } from "../../../autoFunctions/iniciarRelojPreconstruccion.js";

//? Atiende el mensaje msgIniciarPartida: arranca la partida desde el lobby
export function manejarIniciarPartida(sala: CatanRoom, client: Client): void {
    const error = validar(
        { partida: sala.partida, sessionId: client.sessionId },
        [esCreador, enFasePartida(FasePartida.LOBBY)]
    );
    
    if (error) {
        enviarError(client, error);
        return;
    }

    //* Se necesitan al menos 2 jugadores
    if (sala.jugadores.size < 2) {
        enviarError(client, "Se necesitan al menos 2 jugadores para iniciar la partida");
        return;
    }

    //* Se completan los colores de los jugadores que no eligieron color
    completarColores(sala.jugadores);

    //* Se mezcla el orden y el primero de la lista empieza
    mezclar(sala.partida.ordenJugadores);
    sala.partida.turnoActual = sala.partida.ordenJugadores[0];
    sala.broadcast("inicio", { mensaje: "La partida ha comenzado" });
    sala.partida.fase = FasePartida.PRECONSTRUCCION;

    //* Empieza el reloj del primer turno de la preconstruccion
    iniciarRelojPreconstruccion(sala);

    //* setMetadata reemplaza todo, por eso se conserva el resto de campos
    sala.setMetadata({ ...sala.metadata, estado: "EN JUEGO" });

    //* Se cierra la sala para que nadie mas pueda entrar
    sala.lock();
}
