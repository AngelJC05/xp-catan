import type { Room } from "@colyseus/sdk";
import { client } from "./colyseusClient";

let reconexionEnCurso: Promise<Room> | null = null;

export function reconectarUnaVez(token: string): Promise<Room> {
  reconexionEnCurso ??= client.reconnect(token);
  return reconexionEnCurso;
}
