import { Room, Client, CloseCode, Delayed } from "colyseus";
import { CatanState } from "../states/CatanState.js";
import { revisarCaminoMasLargo } from "./ayudantes/revisarCaminoMasLargo.js";
import { manejarChat } from "./handlers/chat/chat.js";
import { manejarIniciarPartida } from "./handlers/partida/iniciarPartida.js";
import { manejarColocarAsentamiento } from "./handlers/construccion/colocarAsentamiento.js";
import { manejarColocarCamino } from "./handlers/construccion/colocarCamino.js";
import { manejarColocarCiudad } from "./handlers/construccion/colocarCiudad.js";
import { manejarLanzarDados } from "./handlers/dados/lanzarDados.js";
import { manejarPasarTurno } from "./handlers/turno/pasarTurno.js";
import { manejarIntercambiarBanca } from "./handlers/comercio/intercambiarBanca.js";
import { manejarOfrecerIntercambio } from "./handlers/comercio/ofrecerIntercambio.js";
import { manejarResponderIntercambio } from "./handlers/comercio/responderIntercambio.js";
import { manejarMoverLadron } from "./handlers/ladron/moverLadron.js";
import { manejarRobarJugador } from "./handlers/ladron/robarJugador.js";
import { manejarDescartarRecursos } from "./handlers/descarte/descartarRecursos.js";
import { manejarComprarCarta } from "./handlers/cartas/comprarCarta.js";
import { manejarCartaCaballero } from "./handlers/cartas/cartaCaballero.js";
import { manejarCartaAbundancia } from "./handlers/cartas/cartaAbundancia.js";
import { manejarCartaMonopolio } from "./handlers/cartas/cartaMonopolio.js";
import { manejarCartaCarreteras } from "./handlers/cartas/cartaCarreteras.js";
import { manejarCaminoGratis } from "./handlers/cartas/caminoGratis.js";
import { manejarCreacion } from "./handlers/sala/crearSala.js";
import { manejarUnirse } from "./handlers/sala/unirseASala.js";
import { manejarSalida } from "./handlers/sala/salirDeSala.js";
import { manejarCaidaConexion } from "./handlers/sala/perderConexion.js";
import { manejarReconexion } from "./handlers/sala/reconectar.js";
import { manejarDestruccion } from "./handlers/sala/destruirSala.js";


export class CatanRoom extends Room {
  maxClients = 4;
  state = new CatanState();
  partida = this.state.partida;
  tablero = this.state.tablero;
  banca = this.state.banca;
  jugadores = this.state.jugadores;
  ofertas = new Map<string, unknown>();
  codigoAcceso = "";


  messages = {

    msgChat: (
      client: Client,
      mensaje: { mensaje: string }
    ) => manejarChat(this, client, mensaje),

    msgIniciarPartida: (client: Client) => manejarIniciarPartida(this, client),

    msgColocarAsentamiento: (
      client: Client,
      mensaje: { h: number, d: number, p: number }
    ) => manejarColocarAsentamiento(this, client, mensaje),

    msgColocarCamino: (
      client: Client,
      mensaje: { h: number, d: number, p: number }
    ) => manejarColocarCamino(this, client, mensaje),

    msgColocarCiudad: (
      client: Client,
      mensaje: { h: number, d: number, p: number }
    ) => manejarColocarCiudad(this, client, mensaje),

    msgLanzarDados: (client: Client) => manejarLanzarDados(this, client),

    msgPasarTurno: (client: Client) => manejarPasarTurno(this, client),

    msgMoverLadron: (
      client: Client,
      mensaje: { h: number, d: number }
    ) => manejarMoverLadron(this, client, mensaje),

    msgRobarJugador: (
      client: Client,
      mensaje: { jugadorRobado: string }
    ) => manejarRobarJugador(this, client, mensaje),

    msgDescartarRecursos: (
      client: Client,
      mensaje: { recurso: string }
    ) => manejarDescartarRecursos(this, client, mensaje),

    msgComprarCarta: (client: Client) => manejarComprarCarta(this, client),

    msgIntercambiarBanca: (
      client: Client,
      mensaje: { recursoEntregado: string, recursoRecibido: string }
    ) => manejarIntercambiarBanca(this, client, mensaje),

    msgIntercambiarJugador: (
      client: Client,
      mensaje: { ofrecidos: Record<string, number>, solicitados: Record<string, number> }
    ) => manejarOfrecerIntercambio(this, client, mensaje),

    msgResponderIntercambio: (
      client: Client,
      mensaje: { respuesta: number }
    ) => manejarResponderIntercambio(this, client, mensaje),

    msgCartaCaballero: (
      client: Client,
      mensaje: { h: number, d: number }
    ) => manejarCartaCaballero(this, client, mensaje),

    msgCartaCarreteras: (client: Client) => manejarCartaCarreteras(this, client),

    msgCaminoGratis: (
      client: Client,
      mensaje: { h: number, d: number, p: number }
    ) => manejarCaminoGratis(this, client, mensaje),

    msgCartaAbundancia: (
      client: Client,
      mensaje: { recurso1: string, recurso2: string }
    ) => manejarCartaAbundancia(this, client, mensaje),

    msgCartaMonopolio: (
      client: Client,
      mensaje: { recurso: string }
    ) => manejarCartaMonopolio(this, client, mensaje),


  };

  //? Recalcula el titulo de camino mas largo
  revisarCaminoMasLargo() {
    revisarCaminoMasLargo(this);
  }

  onCreate(options: any) {
    manejarCreacion(this, options);
  }

  onJoin(client: Client, options: any) {
    manejarUnirse(this, client, options);
  }

  onLeave(client: Client, code: CloseCode) {
    manejarSalida(this, client);
  }

  onDispose() {
    manejarDestruccion(this);
  }

  //* Si un cliente se desconecta tiene 60 segundos para reconectarse
  onDrop(client: Client, code: CloseCode) {
    manejarCaidaConexion(this, client, code);
  }

  onReconnect(client: Client) {
    manejarReconexion(this, client);
  }
}