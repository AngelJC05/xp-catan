import { describe, it } from "mocha";
import assert from "node:assert"
import { validarMensajeChat } from "../src/functions/validarMensajeChat.js";

describe("validarMensajeChat", () => {

    it("texto valido es aceptado", () => {
        const resultado = validarMensajeChat("Hola que tal");
        assert.strictEqual(resultado, "Hola que tal");
    });

    it("texto vacio retorna null", () => {
        const resultado = validarMensajeChat("");
        assert.strictEqual(resultado, null);
    });

    it("texto que supera 100 caracteres se recorta", () => {
        const resultado = validarMensajeChat("a".repeat(110));
        assert.strictEqual(resultado, "a".repeat(100));
    });

    it("espacios en blanco son removidos al inicio y al final", () => {
        const resultado = validarMensajeChat("   Hola que tal   ");
        assert.strictEqual(resultado, "Hola que tal");
    })

})