import type { Client, CloseCode } from "colyseus";
import type { CatanRoom } from "../../CatanRoom.js";

//? Segundos que tiene un jugador para volver antes de que se le saque de la sala
export const SEGUNDOS_RECONEXION = 0;

//? Atiende la caida de conexion de un cliente (onDrop): avisa en el log y le da tiempo para reconectarse
export function manejarCaidaConexion(sala: CatanRoom, client: Client, codigo: CloseCode): void {
    throw new Error("Sin implementar");
}
