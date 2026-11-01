import type { CatanRoom } from "../../CatanRoom.js";
import { FaseJuego } from "../../../common/enums.js";
import { buscarHexagonos } from "../../../functions/buscarHexagonos.js";
import { darRecursosJugador } from "../../../functions/darRecursosJugador.js";
import { verticesDelHexagono } from "../../../functions/verticesDelHexagono.js";

//? Aplica el resultado de una tirada de dados a la partida: reparte recursos o activa el 7
//? Recibe la tirada ya hecha para que tambien la pueda usar un temporizador
export function aplicarTirada(
    sala: CatanRoom,
    tirada: { dado1: number, dado2: number, suma: number }
): void {
    const { dado1, dado2, suma } = tirada;

    //? Notificar a todos los jugadores el resultado de los dados
    sala.broadcast("dados", { dado1, dado2, suma });

    //! Si sale 7 toda la logica cambia, entramos a fase de robo y/o ladron
    if (suma === 7) {
        activarSiete(sala);
        return;
    }

    //* Buscar los hexagonos con dicho numero y traer sus vertices adyacentes
    const hexagonosEncontrados = buscarHexagonos(sala.tablero.hexagonos, suma);

    hexagonosEncontrados.forEach((hexagono) => {
        const vertices = verticesDelHexagono(sala.tablero.vertices, hexagono);

        //* Dar los recursos correspondientes en cada vertice encontrado
        vertices.forEach((vertice) => {
            darRecursosJugador(
                hexagono,
                vertice,
                sala.jugadores,
                sala.banca,
                sala.tablero.ladron
            );
        });
    });

    sala.partida.faseJuego = FaseJuego.ACCIONES;
}

//? Con un 7 quien tenga mas de 7 recursos descarta la mitad; si nadie debe, se pasa al ladron
function activarSiete(sala: CatanRoom): void {
    //* Limpiar a los jugadores que deben descartar
    sala.partida.jugadoresParaDescartar.clear();

    //* Ver el total de cartas de cada jugador
    sala.jugadores.forEach((jugador, sessionId) => {
        let totalRecursos = 0;

        //* Contando la cantidad de recursos
        jugador.recursos.forEach((cantidad) => {
            totalRecursos += cantidad;
        });

        //* Si tiene mas de 7, debe descartar la mitad
        if (totalRecursos > 7) {
            sala.partida.jugadoresParaDescartar.set(sessionId, Math.floor(totalRecursos / 2));
        }
    });

    //* Si alguien debe descartar se va a descarte; si no, directo al ladron
    if (sala.partida.jugadoresParaDescartar.size > 0) {
        sala.partida.faseJuego = FaseJuego.DESCARTE;
    } else {
        sala.partida.faseJuego = FaseJuego.LADRON;
    }
}
