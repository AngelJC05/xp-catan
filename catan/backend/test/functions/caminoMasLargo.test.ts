import { describe, it } from "mocha";
import assert from "node:assert";
import { MapSchema } from "@colyseus/schema";
import { Arista } from "../../src/schemas/Arista.js";
import { Vertice } from "../../src/schemas/Vertices.js";
import { Construccion } from "../../src/common/enums.js";
import { longitudCaminoMasLargo } from "../../src/functions/caminoMasLargo.js";

const YO = "jugadorA";
const RIVAL = "jugadorB";

//? Funcion que devuelve un tablero con los caminos y vertices actuales
function armarTablero(
    misCaminos: string[],
    caminosRival: string[] = [],
    asentamientosRival: string[] = []
) {
    //* Ejemplos de los schemas de aristas y vertices actuales
    const aristas = new MapSchema<Arista>();
    const vertices = new MapSchema<Vertice>();

    //* Funcion auxiliar para poner un camino en una posicion dada por un jugador
    const ponerCamino = (clave: string, propietario: string) => {
        const [h, d, p] = clave.split(",").map(Number);
        const arista = new Arista(h, d, p);
        arista.setPropietario(propietario);
        aristas.set(clave, arista);
    };

    //* Llenado de caminos (aristas) para la prueba
    misCaminos.forEach((clave) => ponerCamino(clave, YO));
    caminosRival.forEach((clave) => ponerCamino(clave, RIVAL));

    //* Llenado de vertices con asentamientos rivales para la prueba
    asentamientosRival.forEach((clave) => {
        const [h, d, p] = clave.split(",").map(Number);
        const vertice = new Vertice(h, d, p);
        vertice.setConstruccion(Construccion.ASENTAMIENTO);
        vertice.setPropietario(RIVAL);
        vertices.set(clave, vertice);
    });

    return { vertices, aristas };
}

describe("longitudCaminoMasLargo", () => {

    it("sin carreteras la longitud es 0", () => {
        const { vertices, aristas } = armarTablero([]);
        assert.strictEqual(longitudCaminoMasLargo(vertices, aristas, YO), 0);
    });

    it("una carretera tiene longitud 1", () => {
        const { vertices, aristas } = armarTablero(["0,0,1"]);
        assert.strictEqual(longitudCaminoMasLargo(vertices, aristas, YO), 1);
    });

    it("una cadena de 3 carreteras conectadas tiene longitud 3", () => {
        const { vertices, aristas } = armarTablero(["0,0,1", "0,0,2", "-1,1,1"]);
        assert.strictEqual(longitudCaminoMasLargo(vertices, aristas, YO), 3);
    });

    it("con dos cadenas separadas (2 y 4) cuenta la mayor", () => {
        const { vertices, aristas } = armarTablero([
            "0,0,0", "0,0,1",
            "-1,1,1", "-1,1,0", "0,1,2", "-2,1,0"   
        ]);
        assert.strictEqual(longitudCaminoMasLargo(vertices, aristas, YO), 4);
    });

    it("las carreteras de otro jugador no cuentan", () => {
        const { vertices, aristas } = armarTablero(
            ["0,0,1"], 
            ["0,0,0", "1,0,2"]
        );
        assert.strictEqual(longitudCaminoMasLargo(vertices, aristas, YO), 1);
    });

    it("Una forma de Y cuentan 2", () => {
        const { vertices, aristas } = armarTablero(["0,1,1", "0,1,2", "-1,1,0"]);
        assert.strictEqual(longitudCaminoMasLargo(vertices, aristas, YO), 2);
    });

    it("un ciclo cuenta como continuo, si se conecta uno mas da 7", () => {
        const { vertices, aristas } = armarTablero([
            "0,0,0", "0,0,1", "0,0,2", "-1,1,0", "0,1,1", "1,0,2", "0,1,0"
        ]);
        assert.strictEqual(longitudCaminoMasLargo(vertices, aristas, YO), 7);
    });

    it("un asentamiento rival en el vertice del medio corta la cadena", () => {
    
        const { vertices, aristas } = armarTablero(
            ["1,0,2", "1,0,1", "2,-1,2"],
            [],
            ["1,0,0"]
        );
        assert.strictEqual(longitudCaminoMasLargo(vertices, aristas, YO), 2);
    });
});
