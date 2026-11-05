import { describe, it } from "mocha";
import assert from "node:assert";
import { OfertaIntercambio } from "../../src/schemas/OfertaIntercambio.js";
import { MapSchema } from "@colyseus/schema";
import { Jugador } from "../../src/schemas/Jugador.js";

describe("OfertaIntercambio", () => {

  it("todosRechazaron es false si alguien no ha respondido", () => {
    const oferta = new OfertaIntercambio();
    oferta.registrarRespuesta("jugadorA", -1);
    oferta.registrarRespuesta("jugadorB", 0);

    assert.strictEqual(oferta.todosRechazaron(), false);
  });

  it("todosRechazaron es true si todos rechazaron", () => {
    const oferta = new OfertaIntercambio();
    oferta.registrarRespuesta("jugadorA", -1);
    oferta.registrarRespuesta("jugadorB", -1);

    assert.strictEqual(oferta.todosRechazaron(), true);
  });
  
});

const OFERENTE = "jugadorA";

//? Funcion que devuelve los jugadores de una partida de prueba
function armarJugadores() {
  const jugadores = new MapSchema<Jugador>();
  jugadores.set(OFERENTE, new Jugador("A"));
  jugadores.set("jugadorB", new Jugador("B"));
  jugadores.set("jugadorC", new Jugador("C"));
  return jugadores;
}

//? Funcion que intenta una oferta mixta sobre una oferta vacia
function proponer(ofrecidos: Record<string, number>, solicitados: Record<string, number>) {
  const oferta = new OfertaIntercambio();
  const resultado = oferta.setOfertaMixta(OFERENTE, armarJugadores(), ofrecidos, solicitados);
  return { oferta, resultado };
}

describe("OfertaIntercambio con varios recursos", () => {

  it("una oferta valida guarda todos los recursos ofrecidos y solicitados", () => {
    const { oferta, resultado } = proponer({ madera: 2, lana: 1 }, { trigo: 1, mineral: 3 });

    assert.strictEqual(resultado.error, false);
    assert.strictEqual(oferta.jugador, OFERENTE);
    assert.deepStrictEqual(Object.fromEntries(oferta.recursosOfrecidos), { madera: 2, lana: 1 });
    assert.deepStrictEqual(Object.fromEntries(oferta.recursosSolicitados), { trigo: 1, mineral: 3 });
  });

  it("una oferta valida espera la respuesta de todos menos del oferente", () => {
    const { oferta } = proponer({ madera: 1 }, { trigo: 1 });

    assert.deepStrictEqual(Object.fromEntries(oferta.respuestas), { jugadorB: 0, jugadorC: 0 });
  });

  it("rechaza si no se ofrece ningun recurso", () => {
    const { resultado } = proponer({}, { trigo: 1 });
    assert.strictEqual(resultado.error, true);
  });

  it("rechaza si no se pide ningun recurso", () => {
    const { resultado } = proponer({ madera: 1 }, {});
    assert.strictEqual(resultado.error, true);
  });

  it("rechaza un recurso que no existe", () => {
    const { resultado } = proponer({ oro: 1 }, { trigo: 1 });
    assert.strictEqual(resultado.error, true);
  });

  it("rechaza cantidades en 0", () => {
    const { resultado } = proponer({ madera: 0 }, { trigo: 1 });
    assert.strictEqual(resultado.error, true);
  });

  it("rechaza cantidades negativas", () => {
    const { resultado } = proponer({ madera: 1 }, { trigo: -2 });
    assert.strictEqual(resultado.error, true);
  });

  it("rechaza cantidades con decimales", () => {
    const { resultado } = proponer({ madera: 1.5 }, { trigo: 1 });
    assert.strictEqual(resultado.error, true);
  });

  it("rechaza cantidades mayores a 19", () => {
    const { resultado } = proponer({ madera: 20 }, { trigo: 1 });
    assert.strictEqual(resultado.error, true);
  });

  it("rechaza ofrecer y pedir el mismo recurso", () => {
    const { resultado } = proponer({ madera: 1, lana: 1 }, { trigo: 1, lana: 2 });
    assert.strictEqual(resultado.error, true);
  });

  it("una oferta rechazada no modifica la oferta", () => {
    const { oferta } = proponer({ madera: 1 }, { madera: 1 });

    assert.strictEqual(oferta.jugador, "");
    assert.strictEqual(oferta.recursosOfrecidos.size, 0);
    assert.strictEqual(oferta.recursosSolicitados.size, 0);
    assert.strictEqual(oferta.respuestas.size, 0);
  });

  it("limpiarOferta vacia tambien los recursos de la oferta mixta", () => {
    const { oferta } = proponer({ madera: 2 }, { trigo: 1 });
    oferta.limpiarOferta();

    assert.strictEqual(oferta.jugador, "");
    assert.strictEqual(oferta.recursosOfrecidos.size, 0);
    assert.strictEqual(oferta.recursosSolicitados.size, 0);
  });

});
