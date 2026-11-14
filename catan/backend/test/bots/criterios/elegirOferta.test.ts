import { describe, it } from "mocha";
import assert from "node:assert";
import { elegirOferta, MAXIMO_POR_OFERTA, type OfertaDelBot } from "../../../src/bots/criterios/elegirOferta.js";

//? Funcion que arma una oferta de un recurso por otro
function oferta(da: string, cantidadDa: number, pide: string, cantidadPide: number): OfertaDelBot {
  return { ofrecidos: { [da]: cantidadDa }, solicitados: { [pide]: cantidadPide } };
}

describe("criterio para elegir una oferta de intercambio", () => {

  it("pide lo que mas le falta y da lo que mas le sobra, parejo", () => {
    const elegida = elegirOferta({ mineral: 2, trigo: 1 }, { madera: 2, lana: 1 }, []);

    assert.deepStrictEqual(elegida, oferta("madera", 2, "mineral", 2));
  });

  it("intercambia como maximo 2 cartas aunque falten y sobren mas", () => {
    const elegida = elegirOferta({ mineral: 3 }, { madera: 5 }, []);

    assert.strictEqual(MAXIMO_POR_OFERTA, 2);
    assert.deepStrictEqual(elegida, oferta("madera", 2, "mineral", 2));
  });

  it("si le sobra menos de lo que pide, da lo que le sobra y pide lo mismo", () => {
    const elegida = elegirOferta({ mineral: 2 }, { madera: 1 }, []);

    assert.deepStrictEqual(elegida, oferta("madera", 1, "mineral", 1));
  });

  it("si le falta menos de lo que puede dar, pide solo lo que le falta", () => {
    const elegida = elegirOferta({ mineral: 1 }, { madera: 3 }, []);

    assert.deepStrictEqual(elegida, oferta("madera", 1, "mineral", 1));
  });

  it("devuelve null si no le falta nada", () => {
    assert.strictEqual(elegirOferta({}, { madera: 3 }, []), null);
  });

  it("devuelve null si no le sobra nada", () => {
    assert.strictEqual(elegirOferta({ mineral: 2 }, {}, []), null);
  });

  it("no repite una oferta que ya intento: baja la cantidad con el mismo par", () => {
    const intentadas = [oferta("madera", 2, "mineral", 2)];

    const elegida = elegirOferta({ mineral: 2 }, { madera: 3, lana: 3 }, intentadas);

    assert.deepStrictEqual(elegida, oferta("madera", 1, "mineral", 1));
  });

  it("si ya probo todas las cantidades de un par pasa a dar otro recurso", () => {
    const intentadas = [oferta("madera", 2, "mineral", 2), oferta("madera", 1, "mineral", 1)];

    const elegida = elegirOferta({ mineral: 2 }, { madera: 3, lana: 3 }, intentadas);

    assert.deepStrictEqual(elegida, oferta("lana", 2, "mineral", 2));
  });

  it("si ya probo todo lo del recurso que mas le falta pasa al siguiente", () => {
    const intentadas = [oferta("madera", 2, "trigo", 2), oferta("madera", 1, "trigo", 1)];

    const elegida = elegirOferta({ mineral: 1, trigo: 2 }, { madera: 2 }, intentadas);

    assert.deepStrictEqual(elegida, oferta("madera", 1, "mineral", 1));
  });

  it("devuelve null si ya intento todas las ofertas posibles", () => {
    const intentadas = [oferta("madera", 1, "mineral", 1)];

    assert.strictEqual(elegirOferta({ mineral: 1 }, { madera: 1 }, intentadas), null);
  });
});
