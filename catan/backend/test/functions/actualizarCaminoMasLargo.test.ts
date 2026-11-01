import { describe, it } from "mocha";
import assert from "node:assert";
import { MapSchema } from "@colyseus/schema";
import { Arista } from "../../src/schemas/Arista.js";
import { Vertice } from "../../src/schemas/Vertices.js";
import { Jugador } from "../../src/schemas/Jugador.js";
import { Partida } from "../../src/schemas/Partida.js";
import { Construccion } from "../../src/common/enums.js";
import { actualizarCaminoMasLargo } from "../../src/functions/actualizarCaminoMasLargo.js";

const A = "jugadorA";
const B = "jugadorB";

const ANILLO_A = ["0,0,0", "0,0,1", "0,0,2", "-1,1,0", "0,1,1", "1,0,2"];
const ANILLO_B = ["2,-2,0", "2,-2,1", "2,-2,2", "1,-1,0", "2,-1,1", "3,-2,2"];

const cadena = (anillo: string[], largo: number) => anillo.slice(0, largo);

//? Partida con dos jugadores y un tablero vacio
function armarPartida() {

    const partida = new Partida();
    const jugadores = new MapSchema<Jugador>();
    jugadores.set(A, new Jugador("Angel"));
    jugadores.set(B, new Jugador("Alan"));
    const aristas = new MapSchema<Arista>();
    const vertices = new MapSchema<Vertice>();

    //* Funcion auxiliar para poner caminos
    const ponerCaminos = (claves: string[], propietario: string) => {
        claves.forEach((clave) => {
            const [h, d, p] = clave.split(",").map(Number);
            const arista = new Arista(h, d, p);
            arista.setPropietario(propietario);
            aristas.set(clave, arista);
        });
    };

    //* Funcion auxiliar para poner asentamientos
    const ponerAsentamiento = (clave: string, propietario: string) => {
        const [h, d, p] = clave.split(",").map(Number);
        const vertice = new Vertice(h, d, p);
        vertice.setConstruccion(Construccion.ASENTAMIENTO);
        vertice.setPropietario(propietario);
        vertices.set(clave, vertice);
    };

    const actualizar = () => actualizarCaminoMasLargo(partida, vertices, aristas, jugadores);

    return { partida, jugadores, ponerCaminos, ponerAsentamiento, actualizar };
}

describe("actualizarCaminoMasLargo", () => {

    it("con menos de 5 caminos nadie recibe el titulo", () => {
        const t = armarPartida();
        t.ponerCaminos(cadena(ANILLO_A, 4), A);

        const resultado = t.actualizar();

        assert.strictEqual(t.partida.caminoMasLargo, "");
        assert.strictEqual(t.jugadores.get(A).longitudCamino, 4);
        assert.strictEqual(t.jugadores.get(A).puntuacion, 0);
        assert.strictEqual(resultado.error, false);
        assert.strictEqual(resultado.mensaje, "");
    });

    it("al llegar a 5 el jugador recibe el titulo y 2 puntos", () => {
        const t = armarPartida();
        t.ponerCaminos(cadena(ANILLO_A, 5), A);

        const resultado = t.actualizar();

        const angel = t.jugadores.get(A)!;
        assert.strictEqual(t.partida.caminoMasLargo, A);
        assert.strictEqual(angel.longitudCamino, 5);
        assert.strictEqual(angel.puntuacion, 2);
        assert.strictEqual(angel.puntosParaGanar, 8);
        assert.strictEqual(resultado.error, false);
        assert.notStrictEqual(resultado.mensaje, "");
    });

    it("un empate no le quita el titulo a quien ya lo tenia", () => {
        const t = armarPartida();
        t.ponerCaminos(cadena(ANILLO_A, 5), A);
        t.actualizar();

        t.ponerCaminos(cadena(ANILLO_B, 5), B);
        const resultado = t.actualizar();

        assert.strictEqual(t.partida.caminoMasLargo, A);
        assert.strictEqual(t.jugadores.get(B).longitudCamino, 5);
        assert.strictEqual(t.jugadores.get(B).puntuacion, 0);
        assert.strictEqual(resultado.error, false);
        assert.strictEqual(resultado.mensaje, "");
    });

    it("quien supera al titular le quita el titulo y los 2 puntos", () => {
        const t = armarPartida();
        t.ponerCaminos(cadena(ANILLO_A, 5), A);
        t.actualizar();

        t.ponerCaminos(cadena(ANILLO_B, 6), B);
        const resultado = t.actualizar();

        const angel = t.jugadores.get(A);
        const alan = t.jugadores.get(B);
        assert.strictEqual(t.partida.caminoMasLargo, B);
        assert.strictEqual(angel.puntuacion, 0);
        assert.strictEqual(angel.puntosParaGanar, 10);
        assert.strictEqual(alan.puntuacion, 2);
        assert.strictEqual(alan.puntosParaGanar, 8);
        assert.strictEqual(resultado.error, false);
        assert.notStrictEqual(resultado.mensaje, "");
    });

    it("si un asentamiento rival lo deja bajo 5, el titular pierde el titulo", () => {
        const t = armarPartida();
        t.ponerCaminos(cadena(ANILLO_A, 5), A);
        t.actualizar();

        t.ponerAsentamiento("0,0,1", B);
        const resultado = t.actualizar();

        const angel = t.jugadores.get(A)!;
        assert.strictEqual(t.partida.caminoMasLargo, "");
        assert.ok(angel.longitudCamino < 5);
        assert.strictEqual(angel.puntuacion, 0);
        assert.strictEqual(angel.puntosParaGanar, 10);
        assert.strictEqual(resultado.error, false);
        assert.notStrictEqual(resultado.mensaje, "");
    });

    it("si el titular lo pierde por un corte y otro tiene 5, se lo lleva", () => {
        const t = armarPartida();
        t.ponerCaminos(cadena(ANILLO_A, 5), A);
        t.actualizar();
        t.ponerCaminos(cadena(ANILLO_B, 5), B);
        t.actualizar();

        t.ponerAsentamiento("0,0,1", B);
        t.actualizar();

        assert.strictEqual(t.partida.caminoMasLargo, B);
        assert.strictEqual(t.jugadores.get(A).puntuacion, 0);
        assert.strictEqual(t.jugadores.get(B).puntuacion, 2);
    });
});
