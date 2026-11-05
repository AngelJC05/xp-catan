import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { terminarTurnoAutomatico } from "../../autoFunctions/turno/terminarTurnoAutomatico.js";

//? Inicia el reloj de las acciones del turno la primera vez que se entra a esa fase
//? Si ya estaba en marcha no se reinicia, asi volver de una carta no le regala tiempo al jugador
export function iniciarRelojAcciones(sala: CatanRoom): void {
    if (sala.temporizador.estaActivo("acciones")) return;

    sala.temporizador.programar(
        "acciones",
        sala.tiempos.acciones,
        () => terminarTurnoAutomatico(sala)
    );
}
