import { FaseJuego, FasePartida } from "../../common/enums.js";
import { Jugador } from "../../schemas/Jugador.js";
import { Partida } from "../../schemas/Partida.js";

//* Datos necesarios para ejecutar las validaciones
export interface Contexto {
    partida: Partida;
    sessionId: string;
    jugador?: Jugador;
}

//* Revisa una condicion, devolvinedo el mensaje de error o null si todo pasa correctamente
export type Guardia = (contexto: Contexto) => string | null;

//? La partida no debe haber finalizado
export const partidaEnCurso: Guardia = (contexto) => {
    throw new Error("Sin implementar");
};

//? El turno debe ser del jugador que actua
export const esSuTurno: Guardia = (contexto) => {
    throw new Error("Sin implementar");
};

//? El jugador que actua debe ser el creador de la sala
export const esCreador: Guardia = (contexto) => {
    throw new Error("Sin implementar");
};

//! Fabrica un guardia si es que la fase de partida es la indicada
export function enFasePartida(fase: FasePartida): Guardia {
    return (contexto) => {
        throw new Error("Sin implementar");
    };
}

//! Fabrica un guardia si es que la fase de juego es la indicada
export function enFaseJuego(fase: FaseJuego): Guardia {
    return (contexto) => {
        throw new Error("Sin implementar");
    };
}
