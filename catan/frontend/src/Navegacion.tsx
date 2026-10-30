import { useState } from "react";
import Home from "./pantallas/Home/Home";
import ElegirModo from "./pantallas/ElegirModo/ElegirModo";
import Lobby from "./pantallas/Lobby/Lobby";
import IngresarNombre from "./pantallas/IngresarNombre/IngresarNombre";
import CrearSala from "./pantallas/CrearSala/CrearSala";
import Reconectando from "./pantallas/Reconectando/Reconectando";
import SalaEspera from "./pantallas/SalaEspera/SalaEspera";
import PartidaTablero from "./pantallas/Partida/Partida";
import { useSalaCatan } from "./hooks/useSalaCatan";
import { leerSesion } from "./servicios/sesionGuardada";
import { guardarNombreJugador, leerNombreJugador } from "./utils/nombreJugador";

const MAX_JUGADORES = 4;
// El backend rechaza msgIniciarPartida con menos de 2 jugadores.
const MIN_JUGADORES = 2;

type Vista = "reconectando" | "inicio" | "nombre" | "elegir" | "lobby" | "crear";

function Navegacion() {
  // Si hay un token guardado, lo primero es intentar volver a esa sala.
  const [vista, setVista] = useState<Vista>(() => (leerSesion() ? "reconectando" : "inicio"));
  // El nombre se guarda en sessionStorage; tras una reconexión también se
  // recupera del estado de la sala.
  const [nombreJugador, setNombreJugador] = useState(leerNombreJugador);
  // Desde dónde se abrió "Crear sala", para que Volver regrese ahí.
  const [origenCrear, setOrigenCrear] = useState<"elegir" | "lobby">("elegir");

  const {
    room, infoSala, jugadores, registro, partidaIniciada, esCreador,
    crearSala, unirseASala, salirDeSala,
  } = useSalaCatan({
    nombreJugador,
    setNombreJugador,
    onSalida: (voluntaria) => setVista(voluntaria ? "elegir" : "inicio"),
    onReconexionFallida: () => setVista("inicio"),
  });

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
        registro={registro}
        onIniciarPartida={() => room.send("msgIniciarPartida")}
        onSalir={salirDeSala}
      />
    );
  }

  return <PartidaTablero sala={room} registro={registro} onSalir={salirDeSala} />;
}

export default Navegacion;
