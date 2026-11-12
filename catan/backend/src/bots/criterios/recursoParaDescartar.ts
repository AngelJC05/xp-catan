import { Jugador } from "../../schemas/Jugador.js";
import type { Costo } from "../metas/costos.js";
import { faltaYSobra } from "../metas/faltaYSobra.js";

//? Elige el recurso que el bot descarta para no perder lo que le sirve para su objetivo:
//? primero del que mas le sobra y, si ya no le sobra nada, del que mas cartas tiene
//? En un empate el primero de sus recursos; devuelve "" si no tiene nada
export function recursoParaDescartar(jugador: Jugador, costo: Costo): string {
    const { sobra } = faltaYSobra(jugador, costo);

    const sobrante = mayor(jugador, (recurso) => sobra[recurso] ?? 0);
    if (sobrante !== "") return sobrante;

    return mayor(jugador, (recurso) => jugador.recursos.get(recurso) ?? 0);
}

//? El recurso del jugador con la cantidad mas alta segun una medida, o "" si todas son 0
function mayor(jugador: Jugador, medida: (recurso: string) => number): string {
    let elegido = "";
    let maximo = 0;

    for (const recurso of jugador.recursos.keys()) {
        if (medida(recurso) > maximo) {
            elegido = recurso;
            maximo = medida(recurso);
        }
    }

    return elegido;
}
