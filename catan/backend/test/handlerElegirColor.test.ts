import { describe, it } from "mocha";
import assert from "node:assert";
import { armarCliente, armarSala } from "./ayudas/salaFalsa.js";
import { ColorJugador, FasePartida } from "../src/common/enums.js";
import { manejarElegirColor } from "../src/rooms/handlers/partida/elegirColor.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";
const LUIS = "jugadorLuis";

//? Devuelve una partida en lobby con 3 jugadores para probar a elegir color
function armarPartida(){
    const armado = armarSala({ [ANGEL]: "Angel", [ALAN]: "Alan", [LUIS]: "Luis" });
    armado.partida.fase = FasePartida.LOBBY;
    return armado;
}

describe("handlerElegirColor", () => {

    it("debe avisar a los jugadores del cambio de color", () => {
        const { sala, jugadores, difundidos } = armarPartida();
        const {client} = armarCliente(ANGEL);

        manejarElegirColor(sala, client, { color: ColorJugador.AMARILLO });
        assert.strictEqual(jugadores.get(ANGEL).color, ColorJugador.AMARILLO);
        assert.deepStrictEqual(difundidos, [
            { tipo: "log", mensaje: { jugador: "Angel", mensaje: " ha elegido el color AMARILLO" } }
        ]);
    });

    it("debe avisar al jugador que ese color ya esta ocupado", () => {
        const { sala, jugadores, difundidos } = armarPartida();
        const {client, enviados} = armarCliente(ANGEL);
        jugadores.get(ALAN).color = ColorJugador.ANARANJADO;

        manejarElegirColor(sala, client, { color: ColorJugador.ANARANJADO });
        assert.strictEqual(jugadores.get(ANGEL).color, ColorJugador.SIN_COLOR);
        assert.deepStrictEqual(enviados, [
            { tipo: "error", mensaje: { mensajeError: "El color elegido ya esta ocupado por otro jugador" } }
        ]);
        assert.strictEqual(difundidos.length, 0);
    });

    it("debe impedir elegir color si ya no estamos en lobby", () => {
        const { sala, jugadores } = armarPartida();
        const {client, enviados} = armarCliente(ANGEL);
        sala.partida.fase = FasePartida.JUEGO;
        
        manejarElegirColor(sala, client, { color: ColorJugador.AMARILLO });
        assert.strictEqual(jugadores.get(ANGEL).color, ColorJugador.SIN_COLOR);
        assert.deepStrictEqual(enviados, [
            { tipo: "error", mensaje: { mensajeError: "No se puede elegir color fuera de la fase de lobby" } }
        ]);
    });

    

})