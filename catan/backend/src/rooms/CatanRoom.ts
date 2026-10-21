import { Room, Client, CloseCode, Delayed } from "colyseus";
import { CatanState } from "../states/CatanState.js";
import { Jugador } from "../schemas/Jugador.js";
import { FasePartida } from "../common/enums.js";
import { verificarVictoria } from "../functions/verificarVictoria.js";
import { sacarJugador } from "../functions/sacarJugador.js";
import { actualizarCaminoMasLargo } from "../functions/actualizarCaminoMasLargo.js";
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

  //? Recalcula el titulo de camino mas largo, avisa en el log y comprueba si el titular gano
  revisarCaminoMasLargo() {
    if (this.partida.fase === FasePartida.FINALIZADA) return;

    //* Actualizar el camino mas largo y obtener el resultado
    const resultado = actualizarCaminoMasLargo(
      this.partida,
      this.tablero.vertices,
      this.tablero.aristas,
      this.jugadores
    );
    if (resultado.error) return;


    if (resultado.mensaje !== "") {
      this.broadcast("log", {
        jugador: "Sistema: ",
        mensaje: resultado.mensaje
      })
    }

    //* El titulo puede transferirse a otro y darle la victoria
    const titular = this.jugadores.get(this.partida.caminoMasLargo);
    if (titular) {
      verificarVictoria(this.partida, titular, this.partida.caminoMasLargo, this);
    }
  }

  onCreate(options: any) {
    console.log("room created!", this.roomId);
    //* si se ingresa codigo de acceso, se setea al atributo de codigo de acceso a la sala
    this.codigoAcceso = options.codigoAcceso || ""

    //* seteamos la data de la sala
    this.setMetadata({
      alias: options.alias || "Catan Room",
      estado: "EN LOBBY",
      privada: options.privada || false,
      anfitrion: options.nombre || ""
    })
  }

  onJoin(client: Client, options: any) {

    if (this.partida.fase !== FasePartida.LOBBY) {
      throw new Error("La partida ya ha comenzado, no puedes unirte");
    }
    if (this.codigoAcceso !== "") {
      if (options.codigoAcceso !== this.codigoAcceso) {
        throw new Error("Codigo de acceso incorrecto");
      }
    }
    console.log(`${client.sessionId} joined the room`);

    this.partida.ordenJugadores.push(client.sessionId);

    this.jugadores.set(client.sessionId, new Jugador(options.nombre));

    if (this.partida.creador == "") {
      this.partida.creador = client.sessionId;
    }
  }

  onLeave(client: Client, code: CloseCode) {

    console.log(`${client.sessionId} left the room`);

    //* Primero revisamos si estamos en la fase de lobby
    if (this.partida.fase === FasePartida.LOBBY) {
      //* Sacamos al jugador que salio
      this.jugadores.delete(client.sessionId);

      //* Borrar al jugador del orden de jugadores
      const indice = this.partida.ordenJugadores.indexOf(client.sessionId);
      if (indice !== -1) {
        this.partida.ordenJugadores.splice(indice, 1);
      }

      //* Si se fue el creador, el siguiente en entrar pasa a ser el anfitrión
      if (this.partida.creador === client.sessionId) {
        this.partida.creador = this.partida.ordenJugadores[0] ?? "";
        this.setMetadata({
          ...this.metadata,
          anfitrion: this.jugadores.get(this.partida.creador)?.nombre ?? ""
        });
      }
      return;
    }

    //* Si ya se estaba jugando se debe eliminar completamente
    if (this.partida.fase === FasePartida.JUEGO || FasePartida.PRECONSTRUCCION) {
      //* Ver si era el creador de la sala
      const eraCreador = this.partida.creador === client.sessionId;

      //* Avisar del abandono
      this.broadcast("log", {
        jugador: this.jugadores.get(client.sessionId)?.nombre,
        mensaje: " ha abandonado la partida"
      })

      sacarJugador(this.partida, this.tablero, this.banca, this.jugadores, client.sessionId);

      //* Por la eliminacion de sus construcciones el camino mas largo puede cambiar
      this.revisarCaminoMasLargo();

      //* Actualizar el creador si era el que abandono
      if (eraCreador) {
        this.setMetadata({
          ...this.metadata,
          anfitrion: this.jugadores.get(this.partida.creador)?.nombre ?? ""
        })
      }

      //* Si al sacarlo se gana avisar
      if (this.partida.fase === FasePartida.FINALIZADA) {
        this.broadcast("log", {
          jugador: "Sistema: ",
          mensaje: `${this.jugadores.get(this.partida.ganador)?.nombre} gana por abandono...`
        })
      }
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  //* Si un cliente se desconecta tiene 30 segundos para reconectarse
  onDrop(client: Client, code: CloseCode) {

    console.log(`${client.sessionId} droppef with code ${code}`);
    //* Avisar en el log que alguient tuvo una caida de conexion
    if (this.partida.fase !== FasePartida.LOBBY) {
      this.broadcast("log", {
        jugador: this.jugadores.get(client.sessionId)?.nombre,
        mensaje: " perdio la conexion, tiene 1 minuto para reconectarse"
      })
    }

    //*Activar la espera de reconexion por 60 segundos
    this.allowReconnection(client, 30);
  }

  onReconnect(client: Client) {
    console.log(`${client.sessionId} reconnected`);
    //* Avisar que logro reconectarse
    this.broadcast("log", {
      jugador: "Sistema: ",
      mensaje: `${this.jugadores.get(client.sessionId)?.nombre} se ha reconectado`
    })
  }
}