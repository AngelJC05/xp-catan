import { FaseJuego, FasePartida } from "../../common/enums.js";
import { Jugador } from "../../schemas/Jugador.js";
import { Partida } from "../../schemas/Partida.js";

//* Datos que necesita un guardia para validar una accion
export interface Contexto {
    partida: Partida;
    sessionId: string;
    jugador?: Jugador;
}

//! Revisa una condicion: devuelve el mensaje de error, o null si todo esta bien
export type Guardia = (contexto: Contexto) => string | null;

//* Mensajes que se pueden mostrar cuando la fase de partida no es la adecuada
const ERROR_FASE_PARTIDA: Record<FasePartida, string> = {
    [FasePartida.LOBBY]: "La partida ya ha comenzado",
    [FasePartida.PRECONSTRUCCION]: "No es la fase de preconstruccion",
    [FasePartida.JUEGO]: "No es la fase de juego",
    [FasePartida.FINALIZADA]: "La partida aun no ha finalizado"
};

//* Mensajes que se pueden mostrar cuando la fase de juego no es la adecuada
const ERROR_FASE_JUEGO: Record<FaseJuego, string> = {
    [FaseJuego.DADOS]: "Ya lanzaste los dados",
    [FaseJuego.ACCIONES]: "Debes lanzar los dados primero",
    [FaseJuego.LADRON]: "No es la fase de mover al ladron",
    [FaseJuego.ROBO]: "No es la fase de robar",
    [FaseJuego.DESCARTE]: "No es la fase de descarte",
    [FaseJuego.CARRETERAS]: "No es la fase de carreteras"
};

//? La partida no debe haber finalizado
export const partidaEnCurso: Guardia = ({ partida }) => {
    if (partida.fase === FasePartida.FINALIZADA) return "La partida ha finalizado";
    return null;
};

//? El turno debe ser del jugador que actua
export const esSuTurno: Guardia = ({ partida, sessionId }) => {
    if (partida.turnoActual !== sessionId) return "No es tu turno";
    return null;
};

//? El jugador que actua debe ser el creador de la sala
export const esCreador: Guardia = ({ partida, sessionId }) => {
    if (partida.creador !== sessionId) return "Solo el creador de la sala puede hacer esto";
    return null;
};

//! Fabrica un guardia que exige que la partida este en la fase indicada
export function enFasePartida(fase: FasePartida): Guardia {
    return ({ partida }) => {
        if (partida.fase !== fase) return ERROR_FASE_PARTIDA[fase];
        return null;
    };
}

//! Fabrica un guardia que exige que el juego este en la fase indicada
export function enFaseJuego(fase: FaseJuego): Guardia {
    return ({ partida }) => {
        if (partida.faseJuego !== fase) return ERROR_FASE_JUEGO[fase];
        return null;
    };
}
