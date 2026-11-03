import { Jugador } from "../../../schemas/Jugador.js";

//? Elige al azar una carta de la mano del jugador y devuelve su recurso, o "" si no tiene ninguna
//? Cada carta cuenta igual, asi que el recurso que mas tiene es el que mas probabilidad tiene de salir
export function elegirRecursoDescarte(jugador: Jugador, azar: () => number = Math.random): string {
    let totalCartas = 0;
    jugador.recursos.forEach((cantidad) => { totalCartas += cantidad; });

    if (totalCartas === 0) return "";

    //* Se elige una posicion entre todas las cartas y se busca de que recurso es
    let posicion = Math.floor(azar() * totalCartas);
    let elegido = "";

    jugador.recursos.forEach((cantidad, recurso) => {
        if (elegido !== "") return;
        if (posicion < cantidad) {
            elegido = recurso;
            return;
        }
        posicion -= cantidad;
    });

    return elegido;
}
