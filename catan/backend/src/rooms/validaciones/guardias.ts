import { Desarrollo, FaseJuego, FasePartida, FasePreconstruccion } from "../../common/enums.js";
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

//* Mensajes que se pueden mostrar cuando se intenta construir en la fase equivocada de la preconstruccion
const ERROR_PASO_PRECONSTRUCCION: Record<FasePreconstruccion, string> = {
    [FasePreconstruccion.ASENTAMIENTO]: "Debes colocar un camino",
    [FasePreconstruccion.CAMINO]: "Coloca primero un asentamiento"
};

//* Mensajes que se pueden mostrar cuando el jugador no tiene la carta que intenta usar
const ERROR_SIN_CARTA: Record<Desarrollo, string> = {
    [Desarrollo.CABALLERO]: "No tienes la carta de caballero",
    [Desarrollo.PUNTOS_VICTORIA]: "No tienes la carta de puntos de victoria",
    [Desarrollo.CARRETERA]: "No tienes la carta de carreteras",
    [Desarrollo.ABUNDANCIA]: "No tienes la carta de abundancia",
    [Desarrollo.MONOPOLIO]: "No tienes la carta de monopolio"
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

//? Las cartas de desarrollo solo se pueden usar una vez por turno
export const puedeUsarCarta: Guardia = ({ partida }) => {
    if (!partida.cartaJugable) return "Solo una carta por turno";
    return null;
};

//! Fabrica un guardia que exige que el jugador tenga la carta de desarrollo indicada
export function tieneCarta(carta: Desarrollo): Guardia {
    return ({ jugador }) => {
        if (!jugador) return "No se encontro al jugador";
        if ((jugador.cartas_usables.get(`${carta}`) ?? 0) < 1) return ERROR_SIN_CARTA[carta];
        return null;
    };
}

//? Revisa las guardias en orden y devuelve el primer error, o null si todas pasan
export function validar(contexto: Contexto, guardias: Guardia[]): string | null {
    for (const guardia of guardias) {
        const error = guardia(contexto);
        if (error) return error;
    }
    return null;
}

//! Fabrica un guardia que exige que la preconstruccion este en la fase indicada
export function enFasePreconstruccion(fase: FasePreconstruccion): Guardia {
    return ({ partida }) => {
        if (partida.fasePreconstruccion !== fase) return ERROR_PASO_PRECONSTRUCCION[fase];
        return null;
    };
}
