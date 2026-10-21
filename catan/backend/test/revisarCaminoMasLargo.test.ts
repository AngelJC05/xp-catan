import { describe, it } from "mocha";
import assert from "node:assert";
import { FasePartida } from "../src/common/enums.js";
import { revisarCaminoMasLargo } from "../src/rooms/ayudantes/revisarCaminoMasLargo.js";
import { Arista } from "../src/schemas/Arista.js";
import { armarSala } from "./ayudas/salaFalsa.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Anillos de caminos conectados: cada uno aporta una cadena de hasta 6 caminos seguidos a un jugador
const ANILLO_ANGEL = ["0,0,0", "0,0,1", "0,0,2", "-1,1,0", "0,1,1", "1,0,2"];
const ANILLO_ALAN = ["2,-2,0", "2,-2,1", "2,-2,2", "1,-1,0", "2,-1,1", "3,-2,2"];

//? Funcion que devuelve una sala en juego con Angel y Alan, y una funcion para ponerles caminos en el tablero
function armarJuego() {
  const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
  armado.partida.fase = FasePartida.JUEGO;

  const ponerCaminos = (anillo: string[], largo: number, propietario: string) => {
    anillo.slice(0, largo).forEach((clave) => {
      const [h, d, p] = clave.split(",").map(Number);
      const arista = new Arista(h, d, p);
      arista.setPropietario(propietario);
      armado.tablero.aristas.set(clave, arista);
    });
  };

  return { ...armado, ponerCaminos };
}

describe("revisarCaminoMasLargo", () => {

  it("no hace nada si la partida ya finalizo", () => {
    const { sala, partida, jugadores, difundidos, ponerCaminos } = armarJuego();
    ponerCaminos(ANILLO_ANGEL, 5, ANGEL);
    partida.fase = FasePartida.FINALIZADA;

    revisarCaminoMasLargo(sala);

    assert.strictEqual(partida.caminoMasLargo, "");
    assert.strictEqual(jugadores.get(ANGEL)?.longitudCamino, 0);
    assert.strictEqual(difundidos.length, 0);
  });

  it("guarda en cada jugador la longitud de su camino", () => {
    const { sala, jugadores, ponerCaminos } = armarJuego();
    ponerCaminos(ANILLO_ANGEL, 3, ANGEL);
    ponerCaminos(ANILLO_ALAN, 2, ALAN);

    revisarCaminoMasLargo(sala);

    assert.strictEqual(jugadores.get(ANGEL)?.longitudCamino, 3);
    assert.strictEqual(jugadores.get(ALAN)?.longitudCamino, 2);
  });

  it("si nada cambia no escribe nada en el log", () => {
    const { sala, partida, difundidos, ponerCaminos } = armarJuego();
    ponerCaminos(ANILLO_ANGEL, 4, ANGEL);

    revisarCaminoMasLargo(sala);

    assert.strictEqual(partida.caminoMasLargo, "");
    assert.strictEqual(difundidos.length, 0);
  });

  it("al llegar a 5 caminos avisa en el log que obtuvo el titulo", () => {
    const { sala, partida, jugadores, difundidos, ponerCaminos } = armarJuego();
    ponerCaminos(ANILLO_ANGEL, 5, ANGEL);

    revisarCaminoMasLargo(sala);

    assert.strictEqual(partida.caminoMasLargo, ANGEL);
    assert.strictEqual(jugadores.get(ANGEL)?.puntuacion, 2);
    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Sistema: ", mensaje: "Angel ha obtenido el camino mas largo" } }
    ]);
  });

  it("si otro lo supera avisa en el log que le quito el titulo", () => {
    const { sala, partida, jugadores, difundidos, ponerCaminos } = armarJuego();
    ponerCaminos(ANILLO_ANGEL, 5, ANGEL);
    revisarCaminoMasLargo(sala);
    difundidos.length = 0;

    ponerCaminos(ANILLO_ALAN, 6, ALAN);
    revisarCaminoMasLargo(sala);

    assert.strictEqual(partida.caminoMasLargo, ALAN);
    assert.strictEqual(jugadores.get(ANGEL)?.puntuacion, 0);
    assert.strictEqual(jugadores.get(ALAN)?.puntuacion, 2);
    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Sistema: ", mensaje: "Alan ha quitado el camino mas largo a Angel" } }
    ]);
  });

  it("si el titular pierde caminos avisa en el log que perdio el titulo", () => {
    const { sala, partida, tablero, difundidos, ponerCaminos } = armarJuego();
    ponerCaminos(ANILLO_ANGEL, 5, ANGEL);
    revisarCaminoMasLargo(sala);
    difundidos.length = 0;

    tablero.aristas.get(ANILLO_ANGEL[0])?.setPropietario("");
    revisarCaminoMasLargo(sala);

    assert.strictEqual(partida.caminoMasLargo, "");
    assert.deepStrictEqual(difundidos, [
      { tipo: "log", mensaje: { jugador: "Sistema: ", mensaje: "Angel ha perdido el camino mas largo" } }
    ]);
  });

  it("si con el titulo el jugador llega a los puntos para ganar, gana la partida", () => {
    const { sala, partida, jugadores, difundidos, ponerCaminos } = armarJuego();
    jugadores.get(ANGEL)!.puntosParaGanar = 2;
    ponerCaminos(ANILLO_ANGEL, 5, ANGEL);

    revisarCaminoMasLargo(sala);

    assert.strictEqual(partida.fase, FasePartida.FINALIZADA);
    assert.strictEqual(partida.ganador, ANGEL);
    assert.deepStrictEqual(difundidos[difundidos.length - 1], {
      tipo: "log",
      mensaje: { jugador: "Sistema: ", mensaje: "Angel HA GANADO LA PARTIDA!!" }
    });
  });

  it("si el titulo no alcanza para ganar, la partida sigue en juego", () => {
    const { sala, partida, ponerCaminos } = armarJuego();
    ponerCaminos(ANILLO_ANGEL, 5, ANGEL);

    revisarCaminoMasLargo(sala);

    assert.strictEqual(partida.fase, FasePartida.JUEGO);
    assert.strictEqual(partida.ganador, "");
  });

  it("cuando nadie tiene el titulo no intenta dar la victoria", () => {
    const { sala, partida, jugadores, ponerCaminos } = armarJuego();
    jugadores.get(ANGEL)!.puntosParaGanar = 0;
    ponerCaminos(ANILLO_ANGEL, 2, ANGEL);

    revisarCaminoMasLargo(sala);

    assert.strictEqual(partida.fase, FasePartida.JUEGO);
  });

});
