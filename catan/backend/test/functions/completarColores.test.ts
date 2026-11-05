import { describe, it } from "mocha";
import assert from "node:assert";
import { armarSala } from "../ayudas/salaFalsa.js";
import { completarColores } from "../../src/functions/completarColores.js";
import { ColorJugador } from "../../src/common/enums.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const LUIS = "jugadorLuis";

//? Function para armar una partida, los jugadores por defecto estan ya sin color
function armarPartida(){
    const armado = armarSala( {[ANGEL]: "Angel", [ALAN]: "Alan", [LUIS]: "Luis" });
    return armado;
}


describe("completarColores", () => {
    
    it("nadie debe quedar sin color", () => {
        const {jugadores} = armarPartida();

        completarColores(jugadores);
        assert.notStrictEqual(jugadores.get(ANGEL).color, ColorJugador.SIN_COLOR);
        assert.notStrictEqual(jugadores.get(ALAN).color, ColorJugador.SIN_COLOR);
        assert.notStrictEqual(jugadores.get(LUIS).color, ColorJugador.SIN_COLOR);
    });

    it("un jugador que eligio color no debe cambiar", () => {
        const {jugadores} = armarPartida();
        jugadores.get(ANGEL).color = ColorJugador.AMARILLO;

        completarColores(jugadores);
        assert.strictEqual(jugadores.get(ANGEL).color, ColorJugador.AMARILLO);
        assert.notStrictEqual(jugadores.get(ALAN).color, ColorJugador.SIN_COLOR);
    });

    it("los colores randomeados no son iguales", () => {
        for(let i=0; i<10; i++){
            const {jugadores} = armarPartida();
    
            completarColores(jugadores);
            assert.notStrictEqual(jugadores.get(ANGEL).color, jugadores.get(ALAN).color);
            assert.notStrictEqual(jugadores.get(ANGEL).color, jugadores.get(LUIS).color);
            assert.notStrictEqual(jugadores.get(ALAN).color, jugadores.get(LUIS).color);
        }
    });

    it("los colores randomeados respetan los elegidos", () => {
        for(let i=0; i<10; i++){
            const {jugadores} = armarPartida();
            jugadores.get(ANGEL).color = ColorJugador.AMARILLO;

            completarColores(jugadores);
            assert.strictEqual(jugadores.get(ANGEL).color, ColorJugador.AMARILLO);
            assert.notStrictEqual(jugadores.get(ALAN).color, ColorJugador.AMARILLO);
            assert.notStrictEqual(jugadores.get(LUIS).color, ColorJugador.AMARILLO);
        }
    });

})