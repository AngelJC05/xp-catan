import { MapSchema } from "@colyseus/schema";
import { Vertice } from "../schemas/Vertices.js";
import { Arista } from "../schemas/Arista.js";
import { Partida } from "../schemas/Partida.js";
import { Jugador } from "../schemas/Jugador.js";
import { Banca } from "../schemas/Banca.js";
import { Construccion, FaseJuego, FasePartida } from "../common/enums.js";

export function construirCamino(
    vertices: MapSchema<Vertice>,
    aristas: MapSchema<Arista>,
    partida: Partida,
    h: number,
    d: number,
    p: number,
    jugador: Jugador,
    banca: Banca,
    sessionId: string
): {
    error: boolean,
    mensaje: string
}{
    // * Verificación básica de la existencia de la arista
    const arista = aristas.get(`${h},${d},${p}`);
    if(!arista){
        return {
            error: true,
            mensaje: "El lugar seleccionado no es válido Papu"
        };
    }

    // * Verificación de que el lugar no esté ocupado
    if(arista.propietario !== ""){
        return {
            error: true,
            mensaje: "Ya hay algo acá"
        };
    }

    // * Verificar que tenga caminos disponibles
    if(jugador.construccionesDisponibles.get(`${Construccion.CAMINO}`) <= 0){
        return {
            error: true,
            mensaje: "No tienes caminos disponibles"
        };
    }

    if(partida.fase === FasePartida.PRECONSTRUCCION){
        // * Validar que el camino se conecte con el asentamiento colocado
        if(!comprobarCaminoPreconstruccion(h, d, p, jugador)){
            return {
                error: true,
                mensaje: "El camino debe conectar con el último asentamiento"
            };
        }
    } else {
        if(partida.faseJuego !== FaseJuego.CARRETERAS){
            // * Validar que el jugador tenga los materiales suficientes
            if(!comprobarMateriales(jugador, partida)){
                return {
                    error: true,
                    mensaje: "No tienes los recursos suficientes"
                }
            }
        }
        // * Validar que pueda colocar la arista en la posición deseada
        const conexion = comprobarCaminoJuego(vertices, aristas, h, d, p, sessionId);
        if(conexion === "bloqueado"){
            return {
                error: true,
                mensaje: "Una construccion rival bloquea ese camino"
            }
        }
        if(conexion === "sinConexion"){
            return {
                error: true,
                mensaje: "El camino debe conectar con alguna construccion tuya"
            }
        }
        if(partida.faseJuego !== FaseJuego.CARRETERAS){
            // * Descontar los materiales del jugador
            eliminarRecursos(jugador, banca);
        }
    }

    // * Actualización del estado de la arista
    arista.setPropietario(sessionId);

    // * Descontar la construcción del jugador
    jugador.construccionesDisponibles.set(
        `${Construccion.CAMINO}`,
        jugador.construccionesDisponibles.get(`${Construccion.CAMINO}`) - 1
    );

    return {
        error: false,
        mensaje: " ha construido un camino"
    }
}

function comprobarMateriales(jugador: Jugador, partida: Partida){
    if(partida.fase === FasePartida.PRECONSTRUCCION) return true;
    if(jugador.recursos.get("madera") < 1) return false;
    if(jugador.recursos.get("ladrillo") < 1) return false;
    return true;
}

function eliminarRecursos(jugador: Jugador, banca: Banca){
    jugador.recursos.set("madera", jugador.recursos.get("madera") - 1);
    jugador.recursos.set("ladrillo", jugador.recursos.get("ladrillo") - 1);
    banca.recursos.set("madera", banca.recursos.get("madera") + 1);
    banca.recursos.set("ladrillo", banca.recursos.get("ladrillo") + 1);
}

function comprobarCaminoPreconstruccion(
    h: number,
    d: number,
    p: number,
    jugador: Jugador
){
    const [hV,dV,pV] = jugador.ultimoAsentamiento.split(",").map(Number);

    if(pV === 0){
        if(h === hV && d === dV && p === 0) return true;
        if(h === hV && d === dV && p === 1) return true;
        if(h === hV + 1 && d === dV - 1 && p === 2) return true;
        return false;
    } else {
        if(h === hV && d === dV && p === 1) return true;
        if(h === hV && d === dV && p === 2) return true;
        if(h === hV - 1 && d === dV && p === 0) return true;
        return false;
    }
}

//? Cada arista une dos vertices; en cada uno se juntan otras dos aristas
function extremosDeArista(h: number, d: number, p: number): {
     vertice: string, 
     aristasVecinas: string[] 
}[] {
    switch(p){
        case 0: return [
            { vertice: `${h},${d},0`, aristasVecinas: [`${h},${d},1`, `${h + 1},${d - 1},2`] },
            { vertice: `${h + 1},${d},1`, aristasVecinas: [`${h + 1},${d},2`, `${h + 1},${d},1`] }
        ];
        case 1: return [
            { vertice: `${h},${d},0`, aristasVecinas: [`${h},${d},0`, `${h + 1},${d - 1},2`] },
            { vertice: `${h},${d},1`, aristasVecinas: [`${h},${d},2`, `${h - 1},${d},0`] }
        ];
        case 2: return [
            { vertice: `${h},${d},1`, aristasVecinas: [`${h},${d},1`, `${h - 1},${d},0`] },
            { vertice: `${h - 1},${d + 1},0`, aristasVecinas: [`${h - 1},${d + 1},0`, `${h - 1},${d + 1},1`] }
        ];
        default: return [];
    }
}

//? Un camino conecta si en alguno de sus extremos hay una construccion propia o un camino propio,
//? y un camino propio no cuenta si pasa por un vertice con una construccion rival
function comprobarCaminoJuego(
    vertices: MapSchema<Vertice>,
    aristas: MapSchema<Arista>,
    h: number,
    d: number,
    p: number,
    sessionId: string
): "ok" | "bloqueado" | "sinConexion" {
    let bloqueado = false;

    for(const { vertice, aristasVecinas } of extremosDeArista(h, d, p)){
        //* Obtener el propietario del vertice
        const propietario = vertices.get(vertice)?.propietario ?? "";

        //* Si es uno mismo no hay problema para construir un camino
        if(propietario === sessionId) return "ok";

        //* Si no hay ninguna arista vecina propia, no hay conexion
        const hayCaminoPropio = aristasVecinas.some((clave) => aristas.get(clave)?.propietario === sessionId);
        if(!hayCaminoPropio) continue;

        //* Si no hay propietario no hay problema para construir
        if(propietario === "") return "ok";

        //* Si hay un propietario rival entonces el camino no se puede construir
        bloqueado = true;
    }

    return bloqueado ? "bloqueado" : "sinConexion";
}
