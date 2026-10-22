import { useEffect, useRef, useState } from "react";
import type { Room } from "@colyseus/sdk";
import { client } from "./pantallas/colyseusClient";
import Home from "./pantallas/Home/Home";
import ElegirModo from "./pantallas/ElegirModo/ElegirModo";
import Lobby from "./pantallas/Lobby/Lobby";
import IngresarNombre from "./pantallas/IngresarNombre/IngresarNombre";
import CrearSala, { type DatosNuevaSala } from "./pantallas/CrearSala/CrearSala";
import Reconectando from "./pantallas/Reconectando/Reconectando";
import SalaEspera, { type JugadorVista } from "./pantallas/SalaEspera/SalaEspera";
import PartidaTablero from "./pantallas/Partida";
import { FASE_PARTIDA } from "./common/fases";
import {
  actualizarToken,
  borrarSesion,
  guardarSesion,
  leerSesion,
  type InfoSala,
} from "./pantallas/sesionGuardada";
import { ERROR_CODIGO_INCORRECTO } from "./pantallas/validacionSala";
import { guardarNombreJugador, leerNombreJugador } from "./pantallas/nombreJugador";

const MAX_JUGADORES = 4;
// El backend rechaza msgIniciarPartida con menos de 2 jugadores.
const MIN_JUGADORES = 2;

interface JugadorEstado {
  nombre: string;
  puntuacion: number;
  color: number;
}

interface EstadoDeSala {
  partida: {
    fase: number;
    turnoActual: string;
    creador: string;
  };
  jugadores: {
    forEach: (callback: (jugador: JugadorEstado, sessionId: string) => void) => void;
  };
}

type Vista = "reconectando" | "inicio" | "nombre" | "elegir" | "lobby" | "crear";

// En modo estricto React ejecuta los efectos dos veces al montar. Guardamos la
// promesa para que las dos ejecuciones esperen el mismo intento de reconexión
// en lugar de gastar el token dos veces.
let reconexionEnCurso: Promise<Room> | null = null;

function reconectarUnaVez(token: string): Promise<Room> {
  reconexionEnCurso ??= client.reconnect(token);
  return reconexionEnCurso;
}

// Traduce los errores del matchmaking de Colyseus a mensajes para el jugador.
function mensajeDeError(error: unknown, accion: "crear" | "unirse"): string {
  const texto = error instanceof Error ? error.message : String(error ?? "");

  // CatanRoom.onJoin lanza "Codigo de acceso incorrecto".
  if (/c[oó]digo de acceso/i.test(texto)) return ERROR_CODIGO_INCORRECTO;
  if (/locked|full|not found|no rooms found/i.test(texto)) {
    return "La sala ya no está disponible: puede que esté llena o que haya cerrado.";
  }
  if (/fetch|network|ECONNREFUSED|Failed/i.test(texto)) {
    return "No se pudo conectar con el servidor. Revisa que el backend esté encendido.";
  }
  return accion === "crear" ? "No se pudo crear la sala. Intenta de nuevo." : "No se pudo entrar a la sala.";
}

function Navegacion() {
  // Si hay un token guardado, lo primero es intentar volver a esa sala.
  const [vista, setVista] = useState<Vista>(() => (leerSesion() ? "reconectando" : "inicio"));
  // El nombre se guarda en sessionStorage; tras una reconexión también se
  // recupera del estado de la sala.
  const [nombreJugador, setNombreJugador] = useState(leerNombreJugador);
  const [room, setRoom] = useState<Room | null>(null);
  const [infoSala, setInfoSala] = useState<InfoSala | null>(null);
  const [jugadores, setJugadores] = useState<JugadorVista[]>([]);
  const [fase, setFase] = useState<number>(FASE_PARTIDA.LOBBY);
  const [creador, setCreador] = useState("");
  // Desde dónde se abrió "Crear sala", para que Volver regrese ahí.
  const [origenCrear, setOrigenCrear] = useState<"elegir" | "lobby">("elegir");
  // Distingue "Salir" (voluntario) de una caída que no se pudo recuperar.
  const salidaVoluntaria = useRef(false);

  // La partida empieza cuando el backend deja de estar en LOBBY (lo cambia
  // msgIniciarPartida), así todos los clientes avanzan a la vez.
  const partidaIniciada = fase !== FASE_PARTIDA.LOBBY;
  const esCreador = room !== null && creador === room.sessionId;

  // Reconexión al cargar la página.
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
        // Pasaron más de 30 segundos, la sala cerró o el servidor no responde:
        // el token ya no sirve, se borra y se empieza desde el inicio.
        console.warn("No se pudo reconectar:", error);
        borrarSesion();
        if (!cancelado) setVista("inicio");
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

      const listaJugadores: JugadorVista[] = [];
      state.jugadores.forEach((jugador, sessionId) => {
        const esUsuarioActual = sessionId === salaActual.sessionId;
        // Tras recargar la pestaña el nombre ya no está en memoria.
        if (esUsuarioActual && jugador.nombre) {
          setNombreJugador((actual) => actual || jugador.nombre);
        }
        listaJugadores.push({
          sessionId,
          nombre: jugador.nombre,
          color: jugador.color,
          score: jugador.puntuacion,
          esUsuarioActual,
          esSuTurno: sessionId === state.partida.turnoActual,
        });
      });
      setJugadores(listaJugadores);
    }

    function alReconectar() {
      // El servidor manda un token nuevo en cada reconexión automática.
      actualizarToken(salaActual.reconnectionToken);
    }

    function alSalir() {
      // Se dispara al salir con el botón o cuando la conexión no se pudo
      // recuperar. En ambos casos el token ya no sirve.
      borrarSesion();
      setRoom(null);
      setInfoSala(null);
      setJugadores([]);
      setFase(FASE_PARTIDA.LOBBY);
      setCreador("");
      setVista(salidaVoluntaria.current ? "elegir" : "inicio");
      salidaVoluntaria.current = false;
    }

    function alRecibirError(err: { mensajeError: string }) {
      alert(err.mensajeError);
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

  // Devuelve null si todo salió bien, o el mensaje de error para la pantalla.
  async function crearSala(datos: DatosNuevaSala): Promise<string | null> {
    try {
      const nuevaSala = await client.create("catan", {
        nombre: nombreJugador,
        alias: datos.alias,
        privada: datos.privada,
        // El creador también pasa por onJoin, que compara este código.
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
    // Se borra antes de salir: si la pestaña se recarga justo ahora, no debe
    // devolvernos a una sala que ya abandonamos.
    borrarSesion();
    salidaVoluntaria.current = true;
    // consented = true: el servidor no guarda el asiento para reconectar.
    if(room.connection?.isOpen){
      room.leave(true);
    }else{
      room.onLeave.invoke(4000);
    }
  }

  function abrirCrearSala(origen: "elegir" | "lobby") {
    setOrigenCrear(origen);
    setVista("crear");
  }

  if (!room) {
    if (vista === "reconectando") {
      return <Reconectando />;
    }

    if (vista === "inicio") {
      return <Home onAbrirMenu={() => setVista(nombreJugador ? "elegir" : "nombre")} />;
    }

    if (vista === "nombre") {
      return (
        <IngresarNombre
          nombreInicial={nombreJugador}
          onConfirmar={(nombre) => {
            guardarNombreJugador(nombre);
            setNombreJugador(nombre);
            setVista("elegir");
          }}
          onVolver={() => setVista("inicio")}
        />
      );
    }

    if (vista === "elegir") {
      return (
        <ElegirModo
          nombreJugador={nombreJugador}
          onCrear={() => abrirCrearSala("elegir")}
          onUnirse={() => setVista("lobby")}
          onVolver={() => setVista("inicio")}
          onCambiarNombre={() => setVista("nombre")}
        />
      );
    }

    if (vista === "crear") {
      return <CrearSala nombreJugador={nombreJugador} onCrear={crearSala} onVolver={() => setVista(origenCrear)} />;
    }

    return (
      <Lobby
        onCrearSala={() => abrirCrearSala("lobby")}
        onUnirseASala={unirseASala}
        onVolver={() => setVista("elegir")}
      />
    );
  }

  if (!partidaIniciada) {
    return (
      <SalaEspera
        room={room}
        infoSala={infoSala}
        jugadores={jugadores}
        maxJugadores={MAX_JUGADORES}
        minJugadores={MIN_JUGADORES}
        esCreador={esCreador}
        onIniciarPartida={() => room.send("msgIniciarPartida")}
        onSalir={salirDeSala}
      />
    );
  }

  return <PartidaTablero sala={room} onSalir={salirDeSala} />;
}

export default Navegacion;
