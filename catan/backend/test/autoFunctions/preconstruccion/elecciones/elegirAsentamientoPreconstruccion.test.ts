import { describe, it } from "mocha";
import assert from "node:assert";
import { MapSchema } from "@colyseus/schema";
import { Vertice } from "../../../../src/schemas/Vertices.js";
import { elegirAsentamientoPreconstruccion } from "../../../../src/autoFunctions/preconstruccion/elecciones/elegirAsentamientoPreconstruccion.js";

//? Funcion que devuelve 3 vertices libres: 0,0,0 y 0,0,1 son vecinos y 1,1,1 esta lejos
function armarVertices() {
  const vertices = new MapSchema<Vertice>();
  vertices.set("0,0,0", new Vertice(0, 0, 0));
  vertices.set("0,0,1", new Vertice(0, 0, 1));
  vertices.set("1,1,1", new Vertice(1, 1, 1));
  return vertices;
}

describe("elegir asentamiento de preconstruccion", () => {

  it("elige el unico vertice valido", () => {
    const vertices = armarVertices();
    vertices.get("0,0,1").setPropietario("jugadorAlan");

    assert.strictEqual(elegirAsentamientoPreconstruccion(vertices), "1,1,1");
  });

  it("siempre elige uno de los vertices validos", () => {
    const vertices = armarVertices();

    for (let i = 0; i < 20; i++) {
      const elegido = elegirAsentamientoPreconstruccion(vertices);
      assert.ok(["0,0,0", "0,0,1", "1,1,1"].includes(elegido));
    }
  });

  it("devuelve vacio si no hay ningun vertice valido", () => {
    const vertices = armarVertices();
    vertices.get("0,0,1").setPropietario("jugadorAlan");
    vertices.get("1,1,1").setPropietario("jugadorAlan");

    assert.strictEqual(elegirAsentamientoPreconstruccion(vertices), "");
  });
});
