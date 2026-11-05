//? Elige al azar a uno de los jugadores que se pueden robar, o "" si no hay ninguno
export function elegirJugadorRobo(posibles: string[], azar: () => number = Math.random): string {
    if (posibles.length === 0) return "";

    return posibles[Math.floor(azar() * posibles.length)];
}
