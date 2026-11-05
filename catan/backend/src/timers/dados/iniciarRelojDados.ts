import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { tiradaAutomatica } from "../../autoFunctions/dados/tiradaAutomatica.js";

//? Inicia el reloj para tirar los dados, o lo reinicia si ya estaba en marcha
export function iniciarRelojDados(sala: CatanRoom): void {
    sala.temporizador.programar(
        "dados",
        sala.tiempos.dados,
        () => tiradaAutomatica(sala)
    );
}
