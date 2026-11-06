import { useEffect, useRef, useState } from "react";
import type { Room } from "@colyseus/sdk";
import { client } from "../servicios/colyseusClient";
import { reconectarUnaVez } from "../servicios/reconexion";
import {
  actualizarToken,
  borrarSesion,
  guardarSesion,
  leerSesion,
  type InfoSala,
} from "../servicios/sesionGuardada";
import type { DatosNuevaSala } from "../pantallas/CrearSala/CrearSala";
import type { JugadorVista } from "../pantallas/SalaEspera/tipos";
import { FASE_PARTIDA } from "../common/fases";
import { CONFIGURACION_POR_DEFECTO, type ConfiguracionSala } from "../common/configuracionSala";
import { mensajeDeError } from "../utils/mensajeErrorSala";
import { useRegistroSala } from "./useRegistroSala";

interface JugadorEstado {
  nombre: string;
  puntuacion: number;
  color: number;
  esBot: boolean;
}

interface EstadoDeSala {
  partida: {
    fase: number;
    turnoActual: string;
    creador: string;
    configuracion: ConfiguracionSala;
  };
  jugadores: {
    forEach: (callback: (jugador: JugadorEstado, sessionId: string) => void) => void;
  };
}

// Copia los valores del schema a un objeto simple para guardarlo en el estado de React
function leerConfiguracion(c: ConfiguracionSala): ConfiguracionSala {
  return {
    preconstruccion: c.preconstruccion,
    dados: c.dados,
    acciones: c.acciones,
    oferta: c.oferta,
    ladron: c.ladron,
    robo: c.robo,
    descarte: c.descarte,
    puntos: c.puntos,
  };
}

interface Opciones {
  nombreJugador: string;
  setNombreJugador: (actualizar: (actual: string) => string) => void;
  onSalida: (voluntaria: boolean) => void;
  onReconexionFallida: () => void;
}

export function useSalaCatan({ nombreJugador, setNombreJugador, onSalida, onReconexionFallida }: Opciones) {
  const [room, setRoom] = useState<Room | null>(null);
  const [infoSala, setInfoSala] = useState<InfoSala | null>(null);
  const [jugadores, setJugadores] = useState<JugadorVista[]>([]);
  const [fase, setFase] = useState<number>(FASE_PARTIDA.LOBBY);
  const [creador, setCreador] = useState("");
  const [configuracion, setConfiguracion] = useState<ConfiguracionSala>(CONFIGURACION_POR_DEFECTO);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const registro = useRegistroSala(room);
  const salidaVoluntaria = useRef(false);

  const partidaIniciada = fase !== FASE_PARTIDA.LOBBY;
  const esCreador = room !== null && creador === room.sessionId;

  useEffect(() => {
    const sesion = leerSesion();
    if (!sesion) return;
    let cancelado = false;

    reconectarUnaVez(sesion.token)
      .then((sala) => {
        if (cancelado) return;
        entrarASala(sala, {
          alias: sesion.alias,
          privada: sesion.privada,
          codigoAcceso: sesion.codigoAcceso,
        });
      })
      .catch((error) => {
        console.warn("No se pudo reconectar:", error);
        borrarSesion();
        if (!cancelado) onReconexionFallida();
      });

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!room) return;
    const salaActual = room;

    function sincronizarEstado(state: EstadoDeSala) {
      if (!state || !state.jugadores || !state.partida) return;

      setFase(state.partida.fase);
      setCreador(state.partida.creador);
      setConfiguracion(leerConfiguracion(state.partida.configuracion));

      const listaJugadores: JugadorVista[] = [];
      state.jugadores.forEach((jugador, sessionId) => {
        const esUsuarioActual = sessionId === salaActual.sessionId;
        if (esUsuarioActual && jugador.nombre) {
          setNombreJugador((actual) => actual || jugador.nombre);
        }
        listaJugadores.push({
          sessionId,
          nombre: jugador.nombre,
          color: jugador.color,
          esBot: jugador.esBot,
          score: jugador.puntuacion,
          esUsuarioActual,
          esSuTurno: sessionId === state.partida.turnoActual,
        });
      });
      setJugadores(listaJugadores);
    }

    function alReconectar() {
      actualizarToken(salaActual.reconnectionToken);
    }

    function alSalir() {
      borrarSesion();
      setRoom(null);
      setInfoSala(null);
      setJugadores([]);
      setFase(FASE_PARTIDA.LOBBY);
      setCreador("");
      setConfiguracion(CONFIGURACION_POR_DEFECTO);
      onSalida(salidaVoluntaria.current);
      salidaVoluntaria.current = false;
    }

    function alRecibirError(err: { mensajeError: string }) {
      setErrorServidor(err.mensajeError);
    }

    sincronizarEstado(salaActual.state as unknown as EstadoDeSala);
    salaActual.onStateChange(sincronizarEstado);
    salaActual.onReconnect(alReconectar);
    salaActual.onLeave(alSalir);
    const quitarOyenteError = salaActual.onMessage("error", alRecibirError);

    return () => {
      salaActual.onStateChange.remove(sincronizarEstado);
      salaActual.onReconnect.remove(alReconectar);
      salaActual.onLeave.remove(alSalir);
      quitarOyenteError();
    };
  }, [room]);

  function entrarASala(sala: Room, info: InfoSala) {
    guardarSesion({ ...info, token: sala.reconnectionToken });
    setInfoSala(info);
    setRoom(sala);
  }

  async function crearSala(datos: DatosNuevaSala): Promise<string | null> {
    try {
      const nuevaSala = await client.create("catan", {
        nombre: nombreJugador,
        alias: datos.alias,
        privada: datos.privada,
        codigoAcceso: datos.privada ? datos.codigoAcceso : "",
      });
      entrarASala(nuevaSala, datos);
      return null;
    } catch (error) {
      console.error("Error creando la sala:", error);
      return mensajeDeError(error, "crear");
    }
  }

  async function unirseASala(id: string, info: InfoSala): Promise<string | null> {
    try {
      const nuevaSala = await client.joinById(id, {
        nombre: nombreJugador,
        codigoAcceso: info.codigoAcceso ?? "",
      });
      entrarASala(nuevaSala, info);
      return null;
    } catch (error) {
      console.error("Error entrando a la sala:", error);
      return mensajeDeError(error, "unirse");
    }
  }

  function salirDeSala() {
    if (!room) return;
    borrarSesion();
    salidaVoluntaria.current = true;
    if (room.connection?.isOpen) {
      room.leave(true);
    } else {
      room.onLeave.invoke(4000);
    }
  }

  return {
    room,
    infoSala,
    jugadores,
    registro,
    errorServidor,
    cerrarError: () => setErrorServidor(null),
    partidaIniciada,
    esCreador,
    configuracion,
    crearSala,
    unirseASala,
    salirDeSala,
  };
}
