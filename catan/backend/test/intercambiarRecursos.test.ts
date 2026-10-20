import { describe, it } from "mocha";
import assert from "node:assert";
import { MapSchema } from "@colyseus/schema";
import { Jugador } from "../src/schemas/Jugador.js";
import { OfertaIntercambio } from "../src/schemas/OfertaIntercambio.js";
import { intercambiarRecursosMixtos } from "../src/functions/intercambiarRecursos.js";

const OFERENTE = "jugadorA";
const ACEPTANTE = "jugadorB";
const TERCERO = "jugadorC";

//? Funcion que devuelve los jugadores de una partida con los recursos dados
function armarJugadores(
    recursosOferente: Record<string, number>,
    recursosAceptante: Record<string, number>,
    recursosTercero: Record<string, number> = {}
) {
    const jugadores = new MapSchema<Jugador>();
    jugadores.set(OFERENTE, new Jugador("A"));
    jugadores.set(ACEPTANTE, new Jugador("B"));
    jugadores.set(TERCERO, new Jugador("C"));

    //* Llenado de recursos para la prueba, los demas quedan en 0
    const darRecursos = (sessionId: string, recursos: Record<string, number>) => {
        for (const [recurso, cantidad] of Object.entries(recursos)) {
            jugadores.get(sessionId).recursos.set(recurso, cantidad);
        }
    };
    darRecursos(OFERENTE, recursosOferente);
    darRecursos(ACEPTANTE, recursosAceptante);
    darRecursos(TERCERO, recursosTercero);

    return jugadores;
}

//? Funcion que devuelve una oferta mixta hecha por el oferente
function armarOferta(
    jugadores: MapSchema<Jugador>,
    ofrecidos: Record<string, number>,
    solicitados: Record<string, number>
) {
    const oferta = new OfertaIntercambio();
    oferta.setOfertaMixta(OFERENTE, jugadores, ofrecidos, solicitados);
    return oferta;
}

//? Recursos actuales de un jugador como objeto para comparar
function recursosDe(jugadores: MapSchema<Jugador>, sessionId: string) {
    return Object.fromEntries(jugadores.get(sessionId).recursos);
}

describe("intercambiarRecursosMixtos", () => {

    it("un intercambio valido mueve todos los recursos en ambos sentidos", () => {
        const jugadores = armarJugadores({ madera: 3, lana: 2 }, { trigo: 4, mineral: 1 });
        const oferta = armarOferta(jugadores, { madera: 2, lana: 1 }, { trigo: 3, mineral: 1 });

        const resultado = intercambiarRecursosMixtos(OFERENTE, ACEPTANTE, jugadores, oferta);

        assert.strictEqual(resultado.error, false);
        assert.deepStrictEqual(recursosDe(jugadores, OFERENTE),
            { madera: 1, trigo: 3, lana: 1, ladrillo: 0, mineral: 1 });
        assert.deepStrictEqual(recursosDe(jugadores, ACEPTANTE),
            { madera: 2, trigo: 1, lana: 1, ladrillo: 0, mineral: 0 });
    });

    it("con las cantidades justas el jugador queda en 0", () => {
        const jugadores = armarJugadores({ madera: 2 }, { trigo: 1 });
        const oferta = armarOferta(jugadores, { madera: 2 }, { trigo: 1 });

        const resultado = intercambiarRecursosMixtos(OFERENTE, ACEPTANTE, jugadores, oferta);

        assert.strictEqual(resultado.error, false);
        assert.strictEqual(jugadores.get(OFERENTE).recursos.get("madera"), 0);
        assert.strictEqual(jugadores.get(ACEPTANTE).recursos.get("trigo"), 0);
    });

    it("los recursos que no participan no cambian", () => {
        const jugadores = armarJugadores({ madera: 2, ladrillo: 5 }, { trigo: 1, ladrillo: 7 });
        const oferta = armarOferta(jugadores, { madera: 1 }, { trigo: 1 });

        intercambiarRecursosMixtos(OFERENTE, ACEPTANTE, jugadores, oferta);

        assert.strictEqual(jugadores.get(OFERENTE).recursos.get("ladrillo"), 5);
        assert.strictEqual(jugadores.get(ACEPTANTE).recursos.get("ladrillo"), 7);
    });

    it("un tercer jugador no se ve afectado", () => {
        const jugadores = armarJugadores({ madera: 2 }, { trigo: 1 }, { madera: 4, trigo: 4 });
        const oferta = armarOferta(jugadores, { madera: 1 }, { trigo: 1 });

        intercambiarRecursosMixtos(OFERENTE, ACEPTANTE, jugadores, oferta);

        assert.deepStrictEqual(recursosDe(jugadores, TERCERO),
            { madera: 4, trigo: 4, lana: 0, ladrillo: 0, mineral: 0 });
    });

    it("si al oferente le falta un recurso no se mueve nada", () => {
        const jugadores = armarJugadores({ madera: 2, lana: 0 }, { trigo: 3 });
        const oferta = armarOferta(jugadores, { madera: 2, lana: 1 }, { trigo: 3 });

        const resultado = intercambiarRecursosMixtos(OFERENTE, ACEPTANTE, jugadores, oferta);

        assert.strictEqual(resultado.error, true);
        assert.strictEqual(resultado.faltaA, "oferente");
        assert.deepStrictEqual(recursosDe(jugadores, OFERENTE),
            { madera: 2, trigo: 0, lana: 0, ladrillo: 0, mineral: 0 });
        assert.deepStrictEqual(recursosDe(jugadores, ACEPTANTE),
            { madera: 0, trigo: 3, lana: 0, ladrillo: 0, mineral: 0 });
    });

    it("si al aceptante le falta un recurso no se mueve nada", () => {
        const jugadores = armarJugadores({ madera: 2 }, { trigo: 3, mineral: 0 });
        const oferta = armarOferta(jugadores, { madera: 2 }, { trigo: 3, mineral: 1 });

        const resultado = intercambiarRecursosMixtos(OFERENTE, ACEPTANTE, jugadores, oferta);

        assert.strictEqual(resultado.error, true);
        assert.strictEqual(resultado.faltaA, "aceptante");
        assert.deepStrictEqual(recursosDe(jugadores, OFERENTE),
            { madera: 2, trigo: 0, lana: 0, ladrillo: 0, mineral: 0 });
        assert.deepStrictEqual(recursosDe(jugadores, ACEPTANTE),
            { madera: 0, trigo: 3, lana: 0, ladrillo: 0, mineral: 0 });
    });

    it("rechaza si el oferente y el aceptante son el mismo jugador", () => {
        const jugadores = armarJugadores({ madera: 2, trigo: 2 }, {});
        const oferta = armarOferta(jugadores, { madera: 1 }, { trigo: 1 });

        const resultado = intercambiarRecursosMixtos(OFERENTE, OFERENTE, jugadores, oferta);

        assert.strictEqual(resultado.error, true);
    });

    it("rechaza si alguno de los jugadores no existe", () => {
        const jugadores = armarJugadores({ madera: 2 }, { trigo: 1 });
        const oferta = armarOferta(jugadores, { madera: 1 }, { trigo: 1 });

        const resultado = intercambiarRecursosMixtos(OFERENTE, "jugadorFantasma", jugadores, oferta);

        assert.strictEqual(resultado.error, true);
    });

    it("rechaza si la oferta no tiene recursos", () => {
        const jugadores = armarJugadores({ madera: 2 }, { trigo: 1 });
        const ofertaVacia = new OfertaIntercambio();

        const resultado = intercambiarRecursosMixtos(OFERENTE, ACEPTANTE, jugadores, ofertaVacia);

        assert.strictEqual(resultado.error, true);
        assert.deepStrictEqual(recursosDe(jugadores, OFERENTE),
            { madera: 2, trigo: 0, lana: 0, ladrillo: 0, mineral: 0 });
    });

});
