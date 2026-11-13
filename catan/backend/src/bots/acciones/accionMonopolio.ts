import type { CatanRoom } from "../../rooms/CatanRoom.js";
import { Desarrollo, FaseJuego, FasePartida } from "../../common/enums.js";
import { usarCartaMonopolio } from "../../rooms/acciones/cartas/usarCartaMonopolio.js";
import { recursosDeLosDemas } from "../criterios/recursosDeLosDemas.js";
import { objetivoDelBot } from "../metas/objetivoDelBot.js";

//? Desde cuantas cartas en manos de los demas vale la pena el monopolio aunque el objetivo no las pida
export const MINIMO_MONOPOLIO = 5;

//? Usa la carta de monopolio:
//? 1. si para su objetivo le falta un solo tipo de recurso y los demas tienen de ese
//? 2. si no, si los demas juntan 5 o mas de algun recurso (el que mas tengan)
//? Lo de los demas lo calcula viendo la banca, como cualquier jugador. Devuelve true si la uso
export function accionMonopolio(sala: CatanRoom, sessionId: string): boolean {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador || !puedeUsarla(sala, sessionId)) return false;

    const deLosDemas = (recurso: string) => recursosDeLosDemas(sala.banca, jugador, recurso);

    const recurso = recursoParaObjetivo(sala, sessionId, deLosDemas) || recursoMasJuntado(sala, deLosDemas);
    if (recurso === "") return false;

    return !usarCartaMonopolio(sala, sessionId, recurso).error;
}

//? El unico tipo de recurso que le falta para su objetivo, si los demas tienen de ese; si no, ""
function recursoParaObjetivo(sala: CatanRoom, sessionId: string, deLosDemas: (recurso: string) => number): string {
    const jugador = sala.jugadores.get(sessionId);
    if (!jugador) return "";

    const tipos = Object.keys(objetivoDelBot(sala.tablero, jugador, sessionId).falta);
    if (tipos.length !== 1 || deLosDemas(tipos[0]) < 1) return "";

    return tipos[0];
}

//? El recurso que mas tienen los demas, si llega a 5; si no, ""
function recursoMasJuntado(sala: CatanRoom, deLosDemas: (recurso: string) => number): string {
    let elegido = "";
    let maximo = MINIMO_MONOPOLIO - 1;

    for (const recurso of sala.banca.recursos.keys()) {
        if (deLosDemas(recurso) > maximo) {
            elegido = recurso;
            maximo = deLosDemas(recurso);
        }
    }

    return elegido;
}

//? Las mismas reglas que un jugador: su turno, la fase de acciones, sin otra carta usada y con la carta
function puedeUsarla(sala: CatanRoom, sessionId: string): boolean {
    const { partida } = sala;
    if (partida.fase !== FasePartida.JUEGO || partida.faseJuego !== FaseJuego.ACCIONES) return false;
    if (partida.turnoActual !== sessionId || !partida.cartaJugable) return false;

    const cartas = sala.jugadores.get(sessionId)?.cartas_usables.get(`${Desarrollo.MONOPOLIO}`) ?? 0;
    return cartas > 0;
}
