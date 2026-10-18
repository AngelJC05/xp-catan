import { MapSchema } from "@colyseus/schema";
import { Construccion, FaseJuego, FasePartida, FasePreconstruccion } from "../common/enums.js";
import { Jugador } from "../schemas/Jugador.js";
import { Banca } from "../schemas/Banca.js";
import { Tablero } from "../schemas/Tablero.js";
import { Partida } from "../schemas/Partida.js";
import { siguienteTurnoPreconstruccion } from "./siguienteTurnoPreconstruccion.js";
import { siguienteTurno } from "./siguienteTurno.js";


export function sacarJugador(
    partida: Partida,
    tablero: Tablero,
    banca: Banca,
    jugadores: MapSchema<Jugador>,
    sessionId: string
){
    const jugador = jugadores.get(sessionId);
    if (!jugador) return;

    //* Devolver sus recursos a la banca
    jugador.recursos.forEach((cantidad, recurso) => {
        banca.recursos.set(recurso, banca.recursos.get(recurso) + cantidad);
    });

    //* Si era su turno, avanzar ANTES de sacarlo del orden
    if(partida.turnoActual === sessionId){
        partida.jugadoresParaRobar.clear();
        partida.jugadoresParaDescartar.clear();
        partida.ofertaIntercambio.limpiarOferta();
        partida.carreterasGratis = 0;

        if (partida.fase === FasePartida.PRECONSTRUCCION){
            partida.fasePreconstruccion = FasePreconstruccion.ASENTAMIENTO;
            siguienteTurnoPreconstruccion(partida);
        }else{
            partida.cartaJugable = true;
            siguienteTurno(partida);
        }
    }

    //* Quitar de las listas pendientes y desbloquear la fase si hace falta
    if (partida.jugadoresParaDescartar.has(sessionId)){
        partida.jugadoresParaDescartar.delete(sessionId);
        if(partida.faseJuego === FaseJuego.DESCARTE && partida.jugadoresParaDescartar.size === 0){
            partida.faseJuego = FaseJuego.LADRON;
        }
    }

    const indiceRobo = partida.jugadoresParaRobar.indexOf(sessionId);
    if (indiceRobo !== -1){
        partida.jugadoresParaRobar.splice(indiceRobo, 1);
        if(partida.faseJuego === FaseJuego.ROBO && partida.jugadoresParaRobar.length === 0){
            partida.faseJuego = FaseJuego.ACCIONES;
        }
    }

    //* Ofertas de intercambio
    const oferta = partida.ofertaIntercambio;
    if(oferta.jugador === sessionId) {
        oferta.limpiarOferta();
    }else if(oferta.respuestas.has(sessionId)){
        oferta.respuestas.delete(sessionId);
        if (oferta.jugador !== "" && oferta.todosRechazaron()){
            oferta.limpiarOferta();
        }
    }

    //* Limpiar sus construcciones del tablero
    tablero.vertices.forEach((vertice) => {
        if(vertice.propietario === sessionId){
            vertice.setPropietario("");
            vertice.setConstruccion(Construccion.VACIO);
        }
    });
    tablero.aristas.forEach((arista) => {
        if (arista.propietario === sessionId){
            arista.setPropietario("");
        }
    });

    //* Ejercito mas grande quitado de el jugador
    if(partida.ejercitoMasGrande === sessionId){
        partida.ejercitoMasGrande = "";
    }

    //* Camino mas largo quitado del jugador, la sala decide si pasa a otro
    if(partida.caminoMasLargo === sessionId){
        partida.caminoMasLargo = "";
    }

    //* Sacarlo del orden y de los jugadores
    const indice = partida.ordenJugadores.indexOf(sessionId);
    if (indice !== -1){
        partida.ordenJugadores.splice(indice, 1);
    }
    jugadores.delete(sessionId);

    //* Caso borde de la preconstruccion mover el turno al siguiente jugador
    if (partida.turnoActual === sessionId){
        partida.turnoActual = partida.fase === FasePartida.JUEGO
        ? partida.ordenJugadores[0]
        : partida.ordenJugadores[partida.ordenJugadores.length - 1];
    }

    //*Pasar el creador al siguiente jugador en el orden
    if (partida.creador === sessionId) {
        partida.creador = partida.ordenJugadores[0] ?? "";
    }

    //* Si queda solo uno, gana de forma automatica
    if (partida.ordenJugadores.length < 2){
        partida.ganador = partida.ordenJugadores[0] ?? "";
        partida.fase = FasePartida.FINALIZADA;
    }
}