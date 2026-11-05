import type { CatanRoom } from "../../CatanRoom.js";

//? Cierra la oferta de intercambio activa y cancela su reloj
//? Es el unico lugar donde termina una oferta, sin importar por que se cerro
export function cerrarOferta(sala: CatanRoom): void {
    sala.partida.ofertaIntercambio.limpiarOferta();
    sala.temporizador.cancelar("oferta");
}
