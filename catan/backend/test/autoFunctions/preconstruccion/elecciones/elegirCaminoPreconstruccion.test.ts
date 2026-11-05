import { describe, it } from "mocha";
import assert from "node:assert";
import { MapSchema } from "@colyseus/schema";
import { Arista } from "../../../../src/schemas/Arista.js";
import { elegirCaminoPreconstruccion } from "../../../../src/autoFunctions/preconstruccion/elecciones/elegirCaminoPreconstruccion.js";

//? Funcion que devuelve las 3 aristas pegadas al vertice 0,0,0
function armarAristas() {
  const aristas = new MapSchema<Arista>();
  aristas.set("0,0,0", new Arista(0, 0, 0));
  aristas.set("0,0,1", new Arista(0, 0, 1));
  aristas.set("1,-1,2", new Arista(1, -1, 2));
  return aristas;
}

describe("elegir camino de preconstruccion", () => {

  it("elige la unica arista libre pegada al asentamiento", () => {
    const aristas = armarAristas();
    aristas.get("0,0,0").setPropietario("jugadorAlan");
    aristas.get("0,0,1").setPropietario("jugadorAlan");

    assert.strictEqual(elegirCaminoPreconstruccion(aristas, "0,0,0"), "1,-1,2");
  });

  it("siempre elige una de las aristas libres", () => {
    const aristas = armarAristas();
    aristas.get("0,0,0").setPropietario("jugadorAlan");

    for (let i = 0; i < 20; i++) {
      const elegida = elegirCaminoPreconstruccion(aristas, "0,0,0");
      assert.ok(elegida === "0,0,1" || elegida === "1,-1,2");
    }
  });

  it("devuelve vacio si no hay ninguna arista libre", () => {
    const aristas = armarAristas();
    aristas.get("0,0,0").setPropietario("jugadorAlan");
    aristas.get("0,0,1").setPropietario("jugadorAlan");
    aristas.get("1,-1,2").setPropietario("jugadorAlan");

    assert.strictEqual(elegirCaminoPreconstruccion(aristas, "0,0,0"), "");
  });
});
