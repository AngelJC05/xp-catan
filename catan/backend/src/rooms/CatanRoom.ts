import { Room, Client, CloseCode, Delayed } from "colyseus";
import { CatanState } from "../states/CatanState.js";
import { revisarCaminoMasLargo } from "./ayudantes/revisarCaminoMasLargo.js";
import { Temporizador } from "../timers/Temporizador.js";
import { TIEMPOS_POR_DEFECTO, type Tiempos } from "../timers/tiempos.js";
import {
  manejarChat,
  manejarIniciarPartida,
  manejarElegirColor,
  manejarColocarAsentamiento,
  manejarColocarCamino,
  manejarColocarCiudad,
  manejarLanzarDados,
  manejarPasarTurno,
  manejarIntercambiarBanca,
  manejarOfrecerIntercambio,
  manejarResponderIntercambio,
  manejarMoverLadron,
  manejarRobarJugador,
  manejarDescartarRecursos,
  manejarComprarCarta,
  manejarCartaCaballero,
  manejarCartaAbundancia,
  manejarCartaMonopolio,
  manejarCartaCarreteras,
  manejarCaminoGratis,
  manejarCreacion,
  manejarUnirse,
  manejarSalida,
  manejarCaidaConexion,
  manejarReconexion,
  manejarDestruccion,
  manejarHora
} from "./handlers/index.js";


export class CatanRoom extends Room {
  maxClients = 4;
  codigoAcceso = "";

  state = new CatanState();
  partida = this.state.partida;
  tablero = this.state.tablero;
  banca = this.state.banca;
  jugadores = this.state.jugadores;
  ofertas = new Map<string, unknown>();
  
  tiempos: Tiempos = { ...TIEMPOS_POR_DEFECTO };
  temporizador = new Temporizador(this.clock, this.partida.relojes);


  messages = {

    msgChat: (
      client: Client,
      mensaje: { mensaje: string }
    ) => manejarChat(this, client, mensaje),

    msgElegirColor: (
      client: Client,
      mensaje: { color: number }
    ) => manejarElegirColor(this, client, mensaje),

    msgIniciarPartida: (client: Client) => manejarIniciarPartida(this, client),

    msgHora: () => manejarHora(),

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