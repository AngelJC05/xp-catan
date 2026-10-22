import { MapSchema } from "@colyseus/schema";
import { Jugador } from "../schemas/Jugador.js";
import { ColorJugador } from "../common/enums.js";

export function completarColores(jugadores: MapSchema<Jugador>){
    //* Obtener los colores disponibles, los que nadie tiene elegidos
    const cantidadColores = Object.values(ColorJugador).length / 2 - 1
    
    const coloresDisponibles = Array.from(
        {length: cantidadColores},
        (_, i) => i +1
    )
    
    jugadores.forEach((jugador) => {
        if(jugador.color === ColorJugador.SIN_COLOR) return;
        const indiceColor = coloresDisponibles.indexOf(jugador.color);
        coloresDisponibles.splice(indiceColor, 1);
    })

    //* Asignar color random a los que tienen SIN_COLOR
    jugadores.forEach((jugador) => {
        if(jugador.color !== ColorJugador.SIN_COLOR) return;
        const indiceRandom = Math.floor(Math.random() * coloresDisponibles.length);
        jugador.color  = coloresDisponibles[indiceRandom];
        coloresDisponibles.splice(indiceRandom, 1);
    })

}