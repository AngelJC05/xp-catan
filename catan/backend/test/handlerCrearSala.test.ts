import { describe, it } from "mocha";
import assert from "node:assert";
import { leerOpciones, manejarCreacion } from "../src/rooms/handlers/sala/crearSala.js";
import { armarSala } from "./ayudas/salaFalsa.js";

describe("handler de crear la sala", () => {

  describe("leerOpciones", () => {

    it("usa valores por defecto si no llega ninguna opcion", () => {
      assert.deepStrictEqual(leerOpciones({}), {
        alias: "Catan Room",
        privada: false,
        codigoAcceso: "",
        anfitrion: ""
      });
    });

    it("usa valores por defecto si las opciones no existen", () => {
      assert.deepStrictEqual(leerOpciones(undefined), {
        alias: "Catan Room",
        privada: false,
        codigoAcceso: "",
        anfitrion: ""
      });
    });

    it("respeta las opciones que si llegan", () => {
      const opciones = leerOpciones({
        alias: "Sala de Angel",
        privada: true,
        codigoAcceso: "1234",
        nombre: "Angel"
      });

      assert.deepStrictEqual(opciones, {
        alias: "Sala de Angel",
        privada: true,
        codigoAcceso: "1234",
        anfitrion: "Angel"
      });
    });

    it("el nombre de quien crea la sala es el anfitrion", () => {
      assert.strictEqual(leerOpciones({ nombre: "Alan" }).anfitrion, "Alan");
    });

    it("trata un alias vacio como si no existiera", () => {
      assert.strictEqual(leerOpciones({ alias: "" }).alias, "Catan Room");
    });

  });

  describe("manejarCreacion", () => {

    it("guarda el codigo de acceso en la sala", () => {
      const { sala } = armarSala();

      manejarCreacion(sala, { codigoAcceso: "1234" });

      assert.strictEqual(sala.codigoAcceso, "1234");
    });

    it("sin codigo de acceso la sala queda abierta", () => {
      const { sala } = armarSala();

      manejarCreacion(sala, {});

      assert.strictEqual(sala.codigoAcceso, "");
    });

    it("deja la metadata de la sala en lobby con los datos recibidos", () => {
      const { sala } = armarSala();

      manejarCreacion(sala, { alias: "Sala de Angel", privada: true, nombre: "Angel" });

      assert.deepStrictEqual(sala.metadata, {
        alias: "Sala de Angel",
        estado: "EN LOBBY",
        privada: true,
        anfitrion: "Angel"
      });
    });

    it("la metadata por defecto no es privada y usa el alias estandar", () => {
      const { sala } = armarSala();

      manejarCreacion(sala, {});

      assert.deepStrictEqual(sala.metadata, {
        alias: "Catan Room",
        estado: "EN LOBBY",
        privada: false,
        anfitrion: ""
      });
    });

    it("el codigo de acceso no se publica en la metadata", () => {
      const { sala } = armarSala();

      manejarCreacion(sala, { codigoAcceso: "1234" });

      assert.strictEqual("codigoAcceso" in (sala.metadata as object), false);
    });

  });

});
