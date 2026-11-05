import { describe, it } from "mocha";
import assert from "node:assert";
import { FaseJuego } from "../../../src/common/enums.js";
import { iniciarRelojDados } from "../../../src/timers/dados/iniciarRelojDados.js";
import { tiradaAutomatica } from "../../../src/autoFunctions/dados/tiradaAutomatica.js";
import { ALAN, armarJuegoConReloj, tiradaDe } from "../../ayudas/juegoConReloj.js";

describe("reloj de dados al vencer", () => {

  it("tira los dados por el jugador del turno y avisa a todos", () => {
    const { sala, partida, difundidos, vencer } = armarJuegoConReloj();
    iniciarRelojDados(sala);

    vencer(0);

    const dados = difundidos.filter((envio) => envio.tipo === "dados");
    assert.strictEqual(dados.length, 1);
    assert.notStrictEqual(partida.faseJuego, FaseJuego.DADOS);
  });

  it("deja de estar activo despues de tirar", () => {
    const { sala, vencer } = armarJuegoConReloj();
    iniciarRelojDados(sala);

    vencer(0);

    assert.strictEqual(sala.temporizador.estaActivo("dados"), false);
  });
});

describe("tirada automatica", () => {

  it("con un numero normal pasa a la fase de acciones", () => {
    const { sala, partida } = armarJuegoConReloj();

    tiradaAutomatica(sala, () => tiradaDe(8));

    assert.strictEqual(partida.faseJuego, FaseJuego.ACCIONES);
  });

  it("con 7 y sin descartes sigue al ladron", () => {
    const { sala, partida } = armarJuegoConReloj();

    tiradaAutomatica(sala, () => tiradaDe(7));

    assert.strictEqual(partida.faseJuego, FaseJuego.LADRON);
  });

  it("con 7 y alguien con mas de 7 recursos sigue al descarte", () => {
    const { sala, partida, jugadores } = armarJuegoConReloj();
    jugadores.get(ALAN).recursos.set("madera", 8);

    tiradaAutomatica(sala, () => tiradaDe(7));

    assert.strictEqual(partida.faseJuego, FaseJuego.DESCARTE);
    assert.strictEqual(partida.jugadoresParaDescartar.get(ALAN), 4);
  });

  it("no tira si ya no esta en la fase de dados", () => {
    const { sala, partida, difundidos } = armarJuegoConReloj();
    partida.faseJuego = FaseJuego.ACCIONES;

    tiradaAutomatica(sala, () => tiradaDe(8));

    assert.strictEqual(difundidos.length, 0);
  });
});
