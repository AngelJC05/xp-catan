import { describe, it } from "mocha";
import assert from "node:assert";
import { FasePartida } from "../../../../src/common/enums.js";
import { SEGUNDOS_RECONEXION, manejarCaidaConexion } from "../../../../src/rooms/handlers/sala/perderConexion.js";
import { manejarReconexion } from "../../../../src/rooms/handlers/sala/reconectar.js";
import { armarCliente, armarSala } from "../../../ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

describe("handlers de caida y reconexion", () => {

  describe("al perder la conexion", () => {

    it("la espera de reconexion dura 60 segundos", () => {
      assert.strictEqual(SEGUNDOS_RECONEXION, 60);
    });

    it("abre la espera de reconexion para ese cliente", () => {
      const { sala, estado } = armarSala({ [ANGEL]: "Angel" });

      manejarCaidaConexion(sala, armarCliente(ANGEL).client, 1006);

      assert.deepStrictEqual(estado.reconexiones, [
        { sessionId: ANGEL, segundos: SEGUNDOS_RECONEXION }
      ]);
    });

    it("en el lobby no escribe nada en el log", () => {
      const { sala, difundidos } = armarSala({ [ANGEL]: "Angel" });

      manejarCaidaConexion(sala, armarCliente(ANGEL).client, 1006);

      assert.strictEqual(difundidos.length, 0);
    });

    it("durante la partida avisa en el log con el nombre y el tiempo para volver", () => {
      const { sala, partida, difundidos } = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
      partida.fase = FasePartida.JUEGO;

      manejarCaidaConexion(sala, armarCliente(ALAN).client, 1006);

      assert.deepStrictEqual(difundidos, [
        { tipo: "log", mensaje: { jugador: "Alan", mensaje: " perdio la conexion, tiene 60 segundos para reconectarse" } }
      ]);
    });

    it("durante la preconstruccion tambien avisa en el log", () => {
      const { sala, partida, difundidos } = armarSala({ [ANGEL]: "Angel" });
      partida.fase = FasePartida.PRECONSTRUCCION;

      manejarCaidaConexion(sala, armarCliente(ANGEL).client, 1006);

      assert.strictEqual(difundidos.length, 1);
    });

    it("durante la partida tambien abre la espera de reconexion", () => {
      const { sala, partida, estado } = armarSala({ [ANGEL]: "Angel" });
      partida.fase = FasePartida.JUEGO;

      manejarCaidaConexion(sala, armarCliente(ANGEL).client, 1006);

      assert.strictEqual(estado.reconexiones.length, 1);
    });

  });

  describe("al reconectarse", () => {

    it("avisa en el log del sistema con el nombre del jugador", () => {
      const { sala, difundidos } = armarSala({ [ANGEL]: "Angel" });

      manejarReconexion(sala, armarCliente(ANGEL).client);

      assert.deepStrictEqual(difundidos, [
        { tipo: "log", mensaje: { jugador: "Sistema: ", mensaje: "Angel se ha reconectado" } }
      ]);
    });

  });

});
