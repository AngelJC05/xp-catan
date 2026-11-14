import { describe, it } from "mocha";
import assert from "node:assert";
import { accionOfertar, MAXIMO_OFERTAS_POR_TURNO } from "../../../src/bots/acciones/accionOfertar.js";
import { FaseJuego } from "../../../src/common/enums.js";
import { ALAN, ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";
import { armarCadena, construir, fijarNumeros } from "../../ayudas/cadena.js";

const PRODUCE_TODO = new Set(["madera", "ladrillo", "trigo", "lana", "mineral"]);

//? Funcion que deja a Angel con un asentamiento, para que su objetivo sea la ciudad, y los recursos indicados
function armarEscenario(recursos: Record<string, number>) {
  const armado = armarJuegoConReloj();
  armado.partida.faseJuego = FaseJuego.ACCIONES;

  const cadena = armarCadena(armado.tablero);
  fijarNumeros(cadena, 0);
  construir(cadena, cadena.vertices[0], ANGEL);

  const angel = armado.jugadores.get(ANGEL);
  for (const [recurso, cantidad] of Object.entries(recursos)) angel.recursos.set(recurso, cantidad);

  return { ...armado, angel };
}

type Escenario = ReturnType<typeof armarEscenario>;

function actuar(escenario: Escenario) {
  return accionOfertar(escenario.sala, ANGEL, PRODUCE_TODO);
}

//? Le faltan 2 de mineral para la ciudad y le sobran 3 de madera
const FALTA_MINERAL = { mineral: 1, trigo: 2, madera: 3 };

describe("accion del bot de proponer ofertas de intercambio", () => {

  it("propone una oferta pidiendo lo que le falta y dando lo que le sobra", () => {
    const escenario = armarEscenario(FALTA_MINERAL);

    assert.strictEqual(actuar(escenario), true);

    const oferta = escenario.partida.ofertaIntercambio;
    assert.strictEqual(oferta.jugador, ANGEL);
    assert.deepStrictEqual(Object.fromEntries(oferta.recursosOfrecidos.entries()), { madera: 2 });
    assert.deepStrictEqual(Object.fromEntries(oferta.recursosSolicitados.entries()), { mineral: 2 });
  });

  it("anota la oferta entre las del turno", () => {
    const escenario = armarEscenario(FALTA_MINERAL);

    actuar(escenario);

    assert.deepStrictEqual(escenario.partida.ofertasDelTurno, [{ ofrecidos: { madera: 2 }, solicitados: { mineral: 2 } }]);
  });

  it("no repite una oferta que ya propuso en el turno", () => {
    const escenario = armarEscenario(FALTA_MINERAL);
    escenario.partida.ofertasDelTurno.push({ ofrecidos: { madera: 2 }, solicitados: { mineral: 2 } });

    assert.strictEqual(actuar(escenario), true);

    const oferta = escenario.partida.ofertaIntercambio;
    assert.deepStrictEqual(Object.fromEntries(oferta.recursosOfrecidos.entries()), { madera: 1 });
    assert.deepStrictEqual(Object.fromEntries(oferta.recursosSolicitados.entries()), { mineral: 1 });
  });

  it("no propone si ya hizo el maximo de ofertas del turno", () => {
    const escenario = armarEscenario(FALTA_MINERAL);
    for (let i = 0; i < MAXIMO_OFERTAS_POR_TURNO; i++) {
      escenario.partida.ofertasDelTurno.push({ ofrecidos: { lana: i + 1 }, solicitados: { ladrillo: i + 1 } });
    }

    assert.strictEqual(actuar(escenario), false);
    assert.strictEqual(escenario.partida.ofertaIntercambio.jugador, "");
  });

  it("no propone si ya hay una oferta activa", () => {
    const escenario = armarEscenario(FALTA_MINERAL);
    escenario.partida.ofertaIntercambio.setOfertaMixta(ALAN, escenario.jugadores, { lana: 1 }, { madera: 1 });

    assert.strictEqual(actuar(escenario), false);
    assert.strictEqual(escenario.partida.ofertaIntercambio.jugador, ALAN);
  });

  it("no propone si su objetivo es comprar una carta", () => {
    const armado = armarJuegoConReloj();
    armado.partida.faseJuego = FaseJuego.ACCIONES;
    armado.jugadores.get(ANGEL).recursos.set("madera", 3);

    assert.strictEqual(accionOfertar(armado.sala, ANGEL, PRODUCE_TODO), false);
    assert.strictEqual(armado.partida.ofertaIntercambio.jugador, "");
  });

  it("no propone si no le falta nada", () => {
    const escenario = armarEscenario({ mineral: 3, trigo: 2, madera: 3 });

    assert.strictEqual(actuar(escenario), false);
  });

  it("no propone si no le sobra nada", () => {
    const escenario = armarEscenario({ mineral: 1, trigo: 2 });

    assert.strictEqual(actuar(escenario), false);
  });

  it("no propone si no es su turno", () => {
    const escenario = armarEscenario(FALTA_MINERAL);
    escenario.partida.turnoActual = ALAN;

    assert.strictEqual(actuar(escenario), false);
  });

  it("no propone si no esta en la fase de acciones", () => {
    const escenario = armarEscenario(FALTA_MINERAL);
    escenario.partida.faseJuego = FaseJuego.DADOS;

    assert.strictEqual(actuar(escenario), false);
  });
});
