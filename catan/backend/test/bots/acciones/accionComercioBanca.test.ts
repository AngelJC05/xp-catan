import { describe, it } from "mocha";
import assert from "node:assert";
import { accionComercioBanca } from "../../../src/bots/acciones/accionComercioBanca.js";
import { Construccion, FaseJuego, Terreno, TipoPuerto } from "../../../src/common/enums.js";
import { ALAN, ANGEL, armarJuegoConReloj } from "../../ayudas/juegoConReloj.js";

//* Angel es el bot y no tiene construcciones: su objetivo es una carta (lana, trigo y mineral)
//? Funcion que devuelve la fase de acciones de Angel con los recursos elegidos
function armarComercio(recursos: Record<string, number> = {}) {
  const armado = armarJuegoConReloj();
  armado.partida.faseJuego = FaseJuego.ACCIONES;

  const angel = armado.jugadores.get(ANGEL);
  Object.entries(recursos).forEach(([recurso, cantidad]) => angel.recursos.set(recurso, cantidad));

  return { ...armado, angel };
}

type Armado = ReturnType<typeof armarComercio>;

//? Le da al bot un puerto del tipo elegido poniendo un asentamiento suyo en uno de sus vertices
//? Sin piezas para construir, su objetivo sigue siendo la carta aunque ya tenga un asentamiento
function darPuerto(armado: Armado, tipo: TipoPuerto) {
  const puerto = [...armado.tablero.puertos.values()][0];
  puerto.tipo = tipo;
  const vertice = armado.tablero.vertices.get(puerto.vertice1);
  vertice.setPropietario(ANGEL);
  vertice.setConstruccion(Construccion.ASENTAMIENTO);
  [Construccion.ASENTAMIENTO, Construccion.CIUDAD, Construccion.CAMINO].forEach((pieza) =>
    armado.angel.construccionesDisponibles.set(`${pieza}`, 0));
}

describe("accion del bot de comerciar con la banca", () => {

  it("si le falta una carta, cambia lo que le sobra por ella con la tasa 4:1", () => {
    const armado = armarComercio({ trigo: 1, mineral: 1, madera: 4 });
    const bancaMadera = armado.banca.recursos.get("madera");
    const bancaLana = armado.banca.recursos.get("lana");

    assert.strictEqual(accionComercioBanca(armado.sala, ANGEL), true);

    assert.strictEqual(armado.angel.recursos.get("lana"), 1);
    assert.strictEqual(armado.angel.recursos.get("madera"), 0);
    assert.strictEqual(armado.banca.recursos.get("madera"), bancaMadera + 4);
    assert.strictEqual(armado.banca.recursos.get("lana"), bancaLana - 1);
  });

  it("entrega el recurso que mas le sobra", () => {
    const armado = armarComercio({ trigo: 1, mineral: 1, madera: 4, ladrillo: 5 });

    assert.strictEqual(accionComercioBanca(armado.sala, ANGEL), true);

    assert.strictEqual(armado.angel.recursos.get("ladrillo"), 1);
    assert.strictEqual(armado.angel.recursos.get("madera"), 4);
  });

  it("entrega el que mas le sobra aunque vaya antes en sus recursos", () => {
    const armado = armarComercio({ trigo: 1, mineral: 1, madera: 5, ladrillo: 4 });

    assert.strictEqual(accionComercioBanca(armado.sala, ANGEL), true);

    assert.strictEqual(armado.angel.recursos.get("madera"), 1);
    assert.strictEqual(armado.angel.recursos.get("ladrillo"), 4);
  });

  it("si le faltan 2 cartas del mismo recurso, no cambia", () => {
    //* Con un asentamiento que produce mineral y trigo su objetivo es la ciudad (3 minerales y 2 trigos)
    //* Tiene 1 mineral y 2 trigos: le faltan 2 minerales
    const armado = armarComercio({ trigo: 2, mineral: 1, madera: 8 });
    const { hexagonos } = armado.tablero;
    hexagonos.get("0,0").terreno = Terreno.MINERAL;
    hexagonos.get("0,0").numero = 6;
    hexagonos.get("1,-1").terreno = Terreno.TRIGO;
    hexagonos.get("1,-1").numero = 8;
    hexagonos.get("0,-1").terreno = Terreno.TRIGO;
    hexagonos.get("0,-1").numero = 9;
    const vertice = armado.tablero.vertices.get("0,0,0");
    vertice.setPropietario(ANGEL);
    vertice.setConstruccion(Construccion.ASENTAMIENTO);

    assert.strictEqual(accionComercioBanca(armado.sala, ANGEL), false);
    assert.strictEqual(armado.angel.recursos.get("madera"), 8);
  });

  it("avisa en el registro que comercio con la banca", () => {
    const armado = armarComercio({ trigo: 1, mineral: 1, madera: 4 });

    accionComercioBanca(armado.sala, ANGEL);

    const avisos = armado.difundidos.filter((envio) =>
      envio.tipo === "log" && JSON.stringify(envio.mensaje).includes("banca"));
    assert.strictEqual(avisos.length, 1);
  });

  it("no cambia si no le sobra lo que pide la tasa", () => {
    const armado = armarComercio({ trigo: 1, mineral: 1, madera: 3 });

    assert.strictEqual(accionComercioBanca(armado.sala, ANGEL), false);
    assert.strictEqual(armado.angel.recursos.get("madera"), 3);
  });

  it("no entrega lo que necesita para su objetivo aunque tenga muchas", () => {
    //* Tiene 4 trigos pero 1 lo necesita: solo le sobran 3
    const armado = armarComercio({ trigo: 4, mineral: 1 });

    assert.strictEqual(accionComercioBanca(armado.sala, ANGEL), false);
  });

  it("con un puerto 3:1 le alcanza con 3", () => {
    const armado = armarComercio({ trigo: 1, mineral: 1, madera: 3 });
    darPuerto(armado, TipoPuerto.GENERICO);

    assert.strictEqual(accionComercioBanca(armado.sala, ANGEL), true);
    assert.strictEqual(armado.angel.recursos.get("madera"), 0);
    assert.strictEqual(armado.angel.recursos.get("lana"), 1);
  });

  it("con un puerto 2:1 de madera le alcanza con 2 maderas", () => {
    const armado = armarComercio({ trigo: 1, mineral: 1, madera: 2 });
    darPuerto(armado, TipoPuerto.MADERA);

    assert.strictEqual(accionComercioBanca(armado.sala, ANGEL), true);
    assert.strictEqual(armado.angel.recursos.get("madera"), 0);
  });

  it("si le faltan 2 cartas o mas, no cambia", () => {
    const armado = armarComercio({ mineral: 1, madera: 8 });

    assert.strictEqual(accionComercioBanca(armado.sala, ANGEL), false);
  });

  it("si no le falta nada, no cambia", () => {
    const armado = armarComercio({ lana: 1, trigo: 1, mineral: 1, madera: 4 });

    assert.strictEqual(accionComercioBanca(armado.sala, ANGEL), false);
  });

  it("si la banca no tiene lo que le falta, no cambia", () => {
    const armado = armarComercio({ trigo: 1, mineral: 1, madera: 4 });
    armado.banca.recursos.set("lana", 0);

    assert.strictEqual(accionComercioBanca(armado.sala, ANGEL), false);
    assert.strictEqual(armado.angel.recursos.get("madera"), 4);
  });

  it("no cambia fuera de la fase de acciones ni fuera de su turno", () => {
    const fueraDeFase = armarComercio({ trigo: 1, mineral: 1, madera: 4 });
    fueraDeFase.partida.faseJuego = FaseJuego.DADOS;
    assert.strictEqual(accionComercioBanca(fueraDeFase.sala, ANGEL), false);

    const otroTurno = armarComercio({ trigo: 1, mineral: 1, madera: 4 });
    otroTurno.partida.turnoActual = ALAN;
    assert.strictEqual(accionComercioBanca(otroTurno.sala, ANGEL), false);
  });
});
