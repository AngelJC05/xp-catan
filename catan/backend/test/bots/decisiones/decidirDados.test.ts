import { describe, it } from "mocha";
import assert from "node:assert";
import { decidirDados } from "../../../src/bots/decisiones/decidirDados.js";
import { FaseJuego } from "../../../src/common/enums.js";
import { iniciarRelojDados } from "../../../src/timers/dados/iniciarRelojDados.js";
import { ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";

describe("decision del bot con los dados", () => {

  it("tira los dados y avisa a todos", () => {
    const { sala, partida, difundidos } = armarJuegoConReloj();

    decidirDados(sala, ANGEL);

    const dados = difundidos.filter((envio) => envio.tipo === "dados");
    assert.strictEqual(dados.length, 1);
    assert.notStrictEqual(partida.faseJuego, FaseJuego.DADOS);
  });

  it("cancela el reloj humano de los dados para que no quede corriendo en la fase siguiente", () => {
    const { sala, programados } = armarJuegoConReloj();
    iniciarRelojDados(sala);

    decidirDados(sala, ANGEL);

    assert.strictEqual(programados[0].cancelado, true);
    assert.strictEqual(sala.temporizador.estaActivo("dados"), false);
  });
});
