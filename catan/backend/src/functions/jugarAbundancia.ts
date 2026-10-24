import { Desarrollo } from "../common/enums.js";
import { Banca } from "../schemas/Banca.js";
import { Jugador } from "../schemas/Jugador.js";

export function jugarAbundancia(
    jugador: Jugador,
    banca: Banca,
    recurso1: string,
    recurso2: string
):{
    error: boolean,
    mensaje: string
}{
    //* Verificar que los recursos existan
    if(!banca.recursos.has(recurso1) || !banca.recursos.has(recurso2)){
        return {
            error: true,
            mensaje: "Los recursos no son validos"
        }
    }

    //* Verificar que la banca tenga suficientes recursos
    if(recurso1 == recurso2){
        if(banca.recursos.get(recurso1) < 2){
            return {
                error: true,
                mensaje: "La banca no tiene suficientes recursos"
            }
        }
    }else{
        if(banca.recursos.get(recurso1) < 1 || banca.recursos.get(recurso2) < 1){
            return {
                error: true,
                mensaje: "La banca no tiene suficientes recursos"
            }
        }
    }

    //* Dar los recursos al jugador
    jugador.recursos.set(recurso1, jugador.recursos.get(recurso1) + 1);
    jugador.recursos.set(recurso2, jugador.recursos.get(recurso2) + 1);

    //* Retirar los recursos de la banca
    banca.recursos.set(recurso1, banca.recursos.get(recurso1) - 1);
    banca.recursos.set(recurso2, banca.recursos.get(recurso2) - 1);

    //* Eliminar la carta de abundancia
    jugador.cartas_usables.set(
        `${Desarrollo.ABUNDANCIA}`,
        jugador.cartas_usables.get(`${Desarrollo.ABUNDANCIA}`) - 1
    );


    return {
        error: false,
        mensaje: " ha usado la carta de abundancia"
    }
}