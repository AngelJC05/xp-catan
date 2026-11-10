import { describe, it } from "mocha";
import assert from "node:assert";
import { decidirRobo } from "../../../src/bots/decisiones/decidirRobo.js";
import { Construccion, FaseJuego } from "../../../src/common/enums.js";
import { verticesDelHexagono } from "../../../src/functions/verticesDelHexagono.js";
import { Jugador } from "../../../src/schemas/Jugador.js";
import type { Hexagono } from "../../../src/schemas/Hexagono.js";
import { manejarMoverLadron } from "../../../src/rooms/handlers/ladron/moverLadron.js";
import { ALAN, ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";
import { armarCliente } from "../../ayudas/salaFalsa.js";

const LUIS = "jugadorLuis";

//? Funcion que devuelve la partida en la fase de robo: Angel movio al ladron junto a Alan y Luis, que tienen un trigo cada uno
function armarRobo() {
  const armado = armarJuegoConReloj();
  armado.jugadores.set(LUIS, new Jugador("Luis"));
  armado.partida.ordenJugadores.push(LUIS);

  //* Un terreno distinto al que tiene el ladron
  let destino: Hexagono | undefined;
  armado.tablero.hexagonos.forEach((hexagono) => {
    const tieneLadron = hexagono.h === armado.tablero.ladron.h && hexagono.d === armado.tablero.ladron.d;
    if (!destino && !tieneLadron) destino = hexagono;
  });

  const vertices = verticesDelHexagono(armado.tablero.vertices, destino as Hexagono);
  [ALAN, LUIS].forEach((rival, i) => {
    vertices[i * 3].setPropietario(rival);
    vertices[i * 3].setConstruccion(Construccion.ASENTAMIENTO);
    armado.jugadores.get(rival).recursos.set("trigo", 1);
  });

  armado.partida.faseJuego = FaseJuego.LADRON;
  manejarMoverLadron(armado.sala, armarCliente(ANGEL).client, { h: (destino as Hexagono).h, d: (destino as Hexagono).d });
  return armado;
}

//? Suma el trigo de varios jugadores
function trigoDe(armado: ReturnType<typeof armarRobo>, ...ids: string[]) {
  return ids.reduce((suma, id) => suma + armado.jugadores.get(id).recursos.get("trigo"), 0);
}

describe("decision del bot en el robo", () => {

  it("le roba una carta a uno de los rivales junto al ladron", () => {
    const armado = armarRobo();

    decidirRobo(armado.sala, ANGEL);

    assert.strictEqual(trigoDe(armado, ANGEL), 1);
    assert.strictEqual(trigoDe(armado, ALAN, LUIS), 1);
  });

  it("cancela el reloj humano del robo", () => {
    const armado = armarRobo();

    decidirRobo(armado.sala, ANGEL);

    assert.strictEqual(armado.programados[0].cancelado, true);
    assert.strictEqual(armado.sala.temporizador.estaActivo("robo"), false);
  });

  it("pasa a la fase de acciones", () => {
    const armado = armarRobo();
    assert.strictEqual(armado.partida.faseJuego, FaseJuego.ROBO);

    decidirRobo(armado.sala, ANGEL);

    assert.strictEqual(armado.partida.faseJuego, FaseJuego.ACCIONES);
  });

  it("avisa en el log que robo pero no dice que se le acabo el tiempo", () => {
    const armado = armarRobo();

    decidirRobo(armado.sala, ANGEL);

    const avisos = armado.difundidos.filter((envio) => envio.tipo === "log");
    assert.ok(avisos.length > 0);
    assert.strictEqual(avisos.filter((envio) => JSON.stringify(envio.mensaje).includes("a tiempo")).length, 0);
  });
});
