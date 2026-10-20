import { MapSchema, Schema, type } from "@colyseus/schema";
import { Jugador } from "./Jugador.js";

//? Recursos que se pueden intercambiar y cuantas cartas hay de cada uno en el juego
const RECURSOS_INTERCAMBIABLES = ["madera", "trigo", "lana", "ladrillo", "mineral"];
const CANTIDAD_MAXIMA = 19;

export class OfertaIntercambio extends Schema {

    @type("string") jugador: string;
    @type("string") recursoOfrecido: string;
    @type("uint8") cantidadOfrecida: number;
    @type("string") recursoSolicitado: string;
    @type("uint8") cantidadSolicitada: number;

    @type({ map: "int8" })
    respuestas = new MapSchema<number>();

    //* Oferta mixta: cada recurso con su cantidad
    @type({ map: "uint8" })
    recursosOfrecidos = new MapSchema<number>();

    @type({ map: "uint8" })
    recursosSolicitados = new MapSchema<number>();

    constructor(){
        super();
        this.jugador = "";
        this.recursoOfrecido = "";
        this.cantidadOfrecida = 0;
        this.recursoSolicitado = "";
        this.cantidadSolicitada = 0;
    }

    setOferta(
        jugador: string,
        jugadores: MapSchema<Jugador>,
        recursoOfrecido: string,
        cantidadOfrecida: number,
        recursoSolicitado: string,
        cantidadSolicitada: number
    ){
        this.jugador = jugador;
        this.recursoOfrecido = recursoOfrecido;
        this.cantidadOfrecida = cantidadOfrecida;
        this.recursoSolicitado = recursoSolicitado;
        this.cantidadSolicitada = cantidadSolicitada;

        this.respuestas.clear();
        for (const [sessionId] of jugadores) {
            if(sessionId !== jugador) this.respuestas.set(sessionId, 0);
        }
    }

    //? Valida y guarda una oferta con varios recursos, si hay error no modifica nada
    setOfertaMixta(
        jugador: string,
        jugadores: MapSchema<Jugador>,
        ofrecidos: Record<string, number>,
        solicitados: Record<string, number>
    ): {
        error: boolean,
        mensaje: string
    } {
        const errorOfrecidos = validarRecursos(ofrecidos, "ofrecer");
        if (errorOfrecidos !== "") return { error: true, mensaje: errorOfrecidos };

        const errorSolicitados = validarRecursos(solicitados, "pedir");
        if (errorSolicitados !== "") return { error: true, mensaje: errorSolicitados };

        //* No se permite pedir y dar lo mismo
        if (Object.keys(ofrecidos).some((recurso) => solicitados[recurso] !== undefined)) {
            return { error: true, mensaje: "No puedes pedir y dar el mismo recurso" };
        }

        this.jugador = jugador;

        this.recursosOfrecidos.clear();
        for (const [recurso, cantidad] of Object.entries(ofrecidos)) {
            this.recursosOfrecidos.set(recurso, cantidad);
        }

        this.recursosSolicitados.clear();
        for (const [recurso, cantidad] of Object.entries(solicitados)) {
            this.recursosSolicitados.set(recurso, cantidad);
        }

        this.respuestas.clear();
        for (const [sessionId] of jugadores) {
            if(sessionId !== jugador) this.respuestas.set(sessionId, 0);
        }

        return { error: false, mensaje: "" };
    }

    registrarRespuesta(jugador: string, respuesta: number){
        this.respuestas.set(jugador, respuesta);
    }

    todosRechazaron(){
        for (const respuesta of this.respuestas.values()){
            if(respuesta !== -1) return false;
        }
        return true;
    }

    limpiarOferta(){
        this.jugador = "";
        this.recursoOfrecido = "";
        this.cantidadOfrecida = 0;
        this.recursoSolicitado = "";
        this.cantidadSolicitada = 0;
        this.respuestas.clear();
        this.recursosOfrecidos.clear();
        this.recursosSolicitados.clear();
    }

}

//? Devuelve el mensaje de error de un lado de la oferta, o "" si es valido
function validarRecursos(recursos: Record<string, number>, accion: string): string {
    const entradas = Object.entries(recursos);
    if (entradas.length === 0) return `Debes ${accion} al menos un recurso`;

    for (const [recurso, cantidad] of entradas) {
        if (!RECURSOS_INTERCAMBIABLES.includes(recurso)) {
            return `El recurso ${recurso} no es valido`;
        }
        if (!Number.isInteger(cantidad) || cantidad <= 0 || cantidad > CANTIDAD_MAXIMA) {
            return `La cantidad de ${recurso} debe ser de 1 a ${CANTIDAD_MAXIMA}`;
        }
    }
    return "";
}