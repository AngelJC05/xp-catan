import { MapSchema } from "@colyseus/schema";
import { Jugador } from "../schemas/Jugador.js";
import { ColorJugador } from "../common/enums.js";


export function elegirColor(
    jugadores: MapSchema<Jugador>,
    sessionId: string,
    colorElegido: number
): {
    error: boolean,
    mensaje: string
}{
    //* Validar que el color exista
    const colores = Object.values(ColorJugador);
    if(!colores.includes(colorElegido)){
        return {
            error: true,
            mensaje: "El color elegido no es valido"
        }
    }
    
    //* Comprobar que no sea el color que el jugador tiene actualmente
    if(colorElegido === jugadores.get(sessionId).color){
        return {
            error: true,
            mensaje: "Ya tienes elegido ese color"
        }
    }

    //* Revisar si el color elegido ya esta ocupado
    let ocupado = false;
    jugadores.forEach((jugador) => {
        if(jugador.color !== ColorJugador.SIN_COLOR && jugador.color === colorElegido) ocupado = true;
    })
    if(ocupado){
        return {
            error: true,
            mensaje: "El color elegido ya esta ocupado por otro jugador"
        }
    }

    //* Colocar el color elegido al jugador
    jugadores.get(sessionId).color = colorElegido;

    //* Eleccion sin color se maneja independiente
    if(colorElegido === ColorJugador.SIN_COLOR){
        return {
            error: false,
            mensaje: " ha seleccionado sin color"
        }
    }

    const nombreColor = ColorJugador[colorElegido];
    return {
        error: false,
        mensaje: ` ha elegido el color ${nombreColor}`
    }

}