import { Schema, type } from "@colyseus/schema";

export class Reloj extends Schema{
    @type("number") inicio: number;
    @type("number") fin: number;

    constructor(inicio: number, fin: number){
        super();
        this.inicio = inicio;
        this.fin = fin;
    }
}
