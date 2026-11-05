import { describe, it } from "mocha";
import assert from "node:assert";
import { manejarHora } from "../../../../src/rooms/handlers/sala/sincronizarHora.js";

describe("handler de sincronizar hora", () => {

  it("responde la hora actual del servidor", () => {
    const antes = Date.now();

    const hora = manejarHora();

    const despues = Date.now();
    assert.ok(hora >= antes && hora <= despues);
  });
});
