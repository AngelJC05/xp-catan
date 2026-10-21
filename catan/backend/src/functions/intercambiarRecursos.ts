import { MapSchema } from "@colyseus/schema";
import { Jugador } from "../schemas/Jugador.js";
import { OfertaIntercambio } from "../schemas/OfertaIntercambio.js";

//? Intercambia todos los recursos de una oferta mixta, si algo no es valido no mueve nada
export function intercambiarRecursosMixtos(
    jugadorOferente: string,
    jugadorAceptante: string,
    jugadores: MapSchema<Jugador>,
    oferta: OfertaIntercambio
): {
    error: boolean,
    mensaje: string,
    faltaA: "oferente" | "aceptante" | ""
} {
    const oferente = jugadores.get(jugadorOferente);
    const aceptante = jugadores.get(jugadorAceptante);

    //* Verificar que ambos jugadores existan y sean distintos
    if (!oferente || !aceptante) {
        return { error: true, mensaje: "El jugador no existe", faltaA: "" };
    }
    if (jugadorOferente === jugadorAceptante) {
        return { error: true, mensaje: "No puedes intercambiar contigo mismo", faltaA: "" };
    }

    //* Verificar que la oferta tenga recursos en ambos lados
    if (oferta.recursosOfrecidos.size === 0 || oferta.recursosSolicitados.size === 0) {
        return { error: true, mensaje: "La oferta no tiene recursos", faltaA: "" };
    }

    //* Revisar ambas partes antes de mover cualquier recurso
    if (!tieneRecursos(oferente, oferta.recursosOfrecidos)) {
        return {
            error: true,
            mensaje: "El negociante ya no tiene los recursos ofrecidos",
            faltaA: "oferente"
        };
    }
    if (!tieneRecursos(aceptante, oferta.recursosSolicitados)) {
        return {
            error: true,
            mensaje: "No tienes los recursos solicitados",
            faltaA: "aceptante"
        };
    }

    //* Pasar lo ofrecido al aceptante y lo solicitado al oferente
    moverRecursos(oferente, aceptante, oferta.recursosOfrecidos);
    moverRecursos(aceptante, oferente, oferta.recursosSolicitados);

    return { error: false, mensaje: "", faltaA: "" };
}

//? Indica si el jugador tiene al menos la cantidad de cada recurso
function tieneRecursos(jugador: Jugador, recursos: MapSchema<number>): boolean {
    for (const [recurso, cantidad] of recursos) {
        if ((jugador.recursos.get(recurso) ?? 0) < cantidad) return false;
    }
    return true;
}

//? Resta los recursos al origen y se los suma al destino
function moverRecursos(origen: Jugador, destino: Jugador, recursos: MapSchema<number>) {
    for (const [recurso, cantidad] of recursos) {
        origen.recursos.set(recurso, origen.recursos.get(recurso) - cantidad);
        destino.recursos.set(recurso, destino.recursos.get(recurso) + cantidad);
    }
}