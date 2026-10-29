import { useEffect, useState } from "react";
import type { RoomAvailable } from "@colyseus/sdk";
import { client } from "../../../servicios/colyseusClient";
import { salaDesdeListado, type MetadataSala, type SalaDisponible } from "../utils/salas";

export type EstadoConexion = "conectando" | "conectado" | "error";

// Conexión en vivo a la LobbyRoom: devuelve todas las salas y las que aún esperan jugadores.
export function useSalasLobby() {
  const [listado, setListado] = useState<RoomAvailable<MetadataSala>[]>([]);
  const [conexion, setConexion] = useState<EstadoConexion>("conectando");

  useEffect(() => {
    // Nos unimos a la LobbyRoom del backend, que envía el listado completo al
    // entrar ("rooms") y luego avisa cada vez que una sala aparece o cambia
    // ("+") o se elimina ("-").
    // Ojo: no filtramos por metadata en el servidor porque, al cambiar el
    // estado a "EN JUEGO", la LobbyRoom no envía "-" (compara la sala con
    // ella misma). Sí envía "+" con los datos nuevos, así que filtramos aquí.
    let cancelado = false;
    let salaLobby: Awaited<ReturnType<typeof client.joinOrCreate>> | null = null;

    client
      .joinOrCreate("lobby", { filter: { name: "catan" } })
      .then((sala) => {
        // En modo estricto React monta, desmonta y vuelve a montar el
        // componente; si ya nos desmontaron, salimos de inmediato.
        if (cancelado) {
          sala.leave();
          return;
        }
        salaLobby = sala;
        setConexion("conectado");

        sala.onMessage("rooms", (salas: RoomAvailable<MetadataSala>[]) => setListado(salas));

        sala.onMessage("+", ([roomId, datos]: [string, RoomAvailable<MetadataSala>]) => {
          setListado((prev) => {
            const indice = prev.findIndex((s) => s.roomId === roomId);
            if (indice === -1) return [...prev, datos];
            const copia = [...prev];
            copia[indice] = datos;
            return copia;
          });
        });

        sala.onMessage("-", (roomId: string) => {
          setListado((prev) => prev.filter((s) => s.roomId !== roomId));
        });
      })
      .catch((error) => {
        console.error("Error conectando al lobby:", error);
        if (!cancelado) setConexion("error");
      });

    return () => {
      cancelado = true;
      salaLobby?.leave();
    };
  }, []);

  const todasLasSalas = listado.map(salaDesdeListado);

  // Solo mostramos salas que todavía esperan jugadores.
  const salas: SalaDisponible[] = listado
    .filter((sala) => sala.metadata?.estado === "EN LOBBY" && sala.clients < sala.maxClients)
    .map(salaDesdeListado);

  return { conexion, todasLasSalas, salas };
}
