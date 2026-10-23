import { describe, it } from "mocha";
import assert from "node:assert";
import { ColorJugador } from "../src/common/enums.js";
import { armarSala } from "./ayudas/salaFalsa.js";
import { elegirColor } from "../src/functions/elegirColor.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que arma una sala con jugadores para elegir colores
function armarPartida(){
    const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan" });
    return armado;
}

describe("elegir color de jugador", () => {

    it("debe permitir elegir el color", () => {
        const {jugadores} = armarPartida();

        const resultado = elegirColor(jugadores, ANGEL, ColorJugador.AMARILLO);
        assert.strictEqual(jugadores.get(ANGEL).color, ColorJugador.AMARILLO);
        assert.strictEqual(resultado.error, false);
        assert.strictEqual(resultado.mensaje, " ha elegido el color AMARILLO");
    });

    it("debe permitir cambiar el color", () => {
        const {jugadores} = armarPartida();
        jugadores.get(ANGEL).color = ColorJugador.VERDE;

        const resultado = elegirColor(jugadores, ANGEL, ColorJugador.AMARILLO);
        assert.strictEqual(jugadores.get(ANGEL).color, ColorJugador.AMARILLO);
        assert.strictEqual(resultado.error, false);
        assert.strictEqual(resultado.mensaje, " ha elegido el color AMARILLO");
    });

    it("debe permitir elegir sin color", () => {
        const {jugadores} = armarPartida();
        jugadores.get(ANGEL).color = ColorJugador.VERDE;

        const resultado = elegirColor(jugadores, ANGEL, ColorJugador.SIN_COLOR);
        assert.strictEqual(jugadores.get(ANGEL).color, ColorJugador.SIN_COLOR);
        assert.strictEqual(resultado.error, false);
        assert.strictEqual(resultado.mensaje, " ha seleccionado sin color");
    });

    it("no debe considerar ocupado el estado sin color aunque otro jugador lo tenga", () => {
        const {jugadores} = armarPartida();
        jugadores.get(ANGEL).color = ColorJugador.VERDE;
        jugadores.get(ALAN).color = ColorJugador.SIN_COLOR;

        const resultado = elegirColor(jugadores, ANGEL, ColorJugador.SIN_COLOR);
        assert.strictEqual(jugadores.get(ANGEL).color, ColorJugador.SIN_COLOR);
        assert.strictEqual(resultado.error, false);
        assert.strictEqual(resultado.mensaje, " ha seleccionado sin color");
    });

    it("debe rechazar color que no existe", () => {
        const {jugadores} = armarPartida();
        jugadores.get(ANGEL).color = ColorJugador.VERDE;

        const resultado = elegirColor(jugadores, ANGEL, 99);
        assert.strictEqual(jugadores.get(ANGEL).color, ColorJugador.VERDE);
        assert.strictEqual(resultado.error, true);
        assert.strictEqual(resultado.mensaje, "El color elegido no es valido");
    });

    it("debe rechazar color que ya ocupa alguien mas", () => {
        const {jugadores} = armarPartida();
        jugadores.get(ALAN).color = ColorJugador.ANARANJADO;
        jugadores.get(ANGEL).color = ColorJugador.AMARILLO;

        const resultado = elegirColor(jugadores, ANGEL, ColorJugador.ANARANJADO);
        assert.strictEqual(jugadores.get(ANGEL).color, ColorJugador.AMARILLO);
        assert.strictEqual(resultado.error, true);
        assert.strictEqual(resultado.mensaje, "El color elegido ya esta ocupado por otro jugador");
    });

    it("debe rechazar el color que el propio jugador ya tiene", () => {
        const {jugadores} = armarPartida();
        jugadores.get(ANGEL).color = ColorJugador.AMARILLO;

        const resultado = elegirColor(jugadores, ANGEL, ColorJugador.AMARILLO);
        assert.strictEqual(jugadores.get(ANGEL).color, ColorJugador.AMARILLO);
        assert.strictEqual(resultado.error, true);
        assert.strictEqual(resultado.mensaje, "Ya tienes elegido ese color");
    });

});