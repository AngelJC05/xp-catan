import { describe, it } from "mocha";
import assert from "node:assert";
import { MapSchema } from "@colyseus/schema";
import { Vertice } from "../../../../src/schemas/Vertices.js";
import { verticesValidosPreconstruccion } from "../../../../src/autoFunctions/preconstruccion/elecciones/verticesValidosPreconstruccion.js";

//? Funcion que devuelve 3 vertices libres
function armarVertices() {
  const vertices = new MapSchema<Vertice>();
  vertices.set("0,0,0", new Vertice(0, 0, 0));
  vertices.set("0,0,1", new Vertice(0, 0, 1));
  vertices.set("1,1,1", new Vertice(1, 1, 1));
  return vertices;
}

describe("vertices validos en preconstruccion", () => {

  it("devuelve todos los vertices si estan libres y sin vecinos ocupados", () => {
    const vertices = armarVertices();

    assert.deepStrictEqual(
      verticesValidosPreconstruccion(vertices).sort(),
      ["0,0,0", "0,0,1", "1,1,1"]
    );
  });

  it("no devuelve los vertices que ya tienen propietario", () => {
    const vertices = armarVertices();
    vertices.get("1,1,1").setPropietario("jugadorAlan");

    assert.deepStrictEqual(
      verticesValidosPreconstruccion(vertices).sort(),
      ["0,0,0", "0,0,1"]
    );
  });

  it("no devuelve los vertices pegados a un asentamiento", () => {
    const vertices = armarVertices();
    vertices.get("0,0,1").setPropietario("jugadorAlan");

    assert.deepStrictEqual(verticesValidosPreconstruccion(vertices), ["1,1,1"]);
  });
});
