import { Room, Client, CloseCode, Delayed } from "colyseus";
import { CatanState } from "../states/CatanState.js";
import { Jugador } from "../schemas/Jugador.js";
import { Desarrollo, FaseJuego, FasePartida } from "../common/enums.js";
import { siguienteTurno } from "../functions/siguienteTurno.js";
import { verificarVictoria } from "../functions/verificarVictoria.js";
import { construirCiudad } from "../functions/construirCiudad.js";
import { comerciarBanca } from "../functions/comerciarBanca.js";
import { moverLadron } from "../functions/moverLadron.js";
import { robarJugador } from "../functions/robarJugador.js";
import { jugarCaballero } from "../functions/jugarCaballero.js";
import { activarCartasCompradas } from "../functions/activarCartasCompradas.js";
import { intercambiarRecursosMixtos } from "../functions/intercambiarRecursos.js";
import { construirCamino } from "../functions/construirCaminos.js";
import { jugarAbundancia } from "../functions/jugarAbundancia.js";
import { jugarMonopolio } from "../functions/jugarMonopolio.js";
import { comprarCarta } from "../functions/comprarCarta.js";
import { sacarJugador } from "../functions/sacarJugador.js";
import { actualizarCaminoMasLargo } from "../functions/actualizarCaminoMasLargo.js";
import { manejarChat } from "./handlers/chat/chat.js";
import { manejarIniciarPartida } from "./handlers/partida/iniciarPartida.js";
import { manejarColocarAsentamiento } from "./handlers/construccion/colocarAsentamiento.js";
import { manejarColocarCamino } from "./handlers/construccion/colocarCamino.js";
import { manejarLanzarDados } from "./handlers/dados/lanzarDados.js";
import { manejarMoverLadron } from "./handlers/ladron/moverLadron.js";
import { manejarDescartarRecursos } from "./handlers/descarte/descartarRecursos.js";


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

    msgLanzarDados: (client: Client) => manejarLanzarDados(this, client),

    msgMoverLadron: (
      client: Client, 
      mensaje: { h: number, d: number }
    ) => manejarMoverLadron(this, client, mensaje),

    msgDescartarRecursos: (
      client: Client, 
      mensaje: { recurso: string }
    ) => manejarDescartarRecursos(this, client, mensaje),

    msgIntercambiarBanca: (
      client: Client,
      mensaje: { recursoEntregado: string, recursoRecibido: string }
    ) => {
      //* Verificar que sea el turno del jugador
      if (this.partida.turnoActual !== client.sessionId) {
        client.send("error", {
          mensajeError: "No es tu turno"
        })
        return;
      }

      //* Verificar que estemos en la fase de acciones
      if (this.partida.faseJuego !== FaseJuego.ACCIONES) {
        client.send("error", {
          mensajeError: "Termian de lanzar los dados primero"
        })
        return;
      }

      //* Intentar realizar el intercambio con la banca
      const resultado = comerciarBanca(
        this.jugadores.get(client.sessionId), this.banca, client.sessionId,
        this.tablero.vertices, this.tablero.puertos,
        mensaje.recursoEntregado, mensaje.recursoRecibido
      );

      //* Si el intercambio fallo, notificar error
      if (resultado.error) {
        client.send("error", {
          mensajeError: resultado.mensaje
        })
        return;
      }

      //* Log del intecambio con la banca
      if(!resultado.error){
        this.broadcast("log", {
          jugador: this.jugadores.get(client.sessionId)?.nombre,
          mensaje: resultado.mensaje
        })
      }

    },


    msgColocarCiudad: (
      client: Client,
      mensaje: { h: number, d: number, p: number }
    ) => {
      //* Verificar que la partida siga un curso
      if (this.partida.fase === FasePartida.FINALIZADA) {
        client.send("error", {
          mensajeError: "La partida ha finalizado"
        })
        return;
      }

      //*Verificar que sea el turno del jugador
      if (this.partida.turnoActual !== client.sessionId) {
        client.send("error", {
          mensajeError: "No es tu turno"
        })
        return;
      }

      //* Verificar que estemos en la fase de juego
      if (this.partida.fase !== FasePartida.JUEGO) {
        client.send("error", {
          mensajeError: "No es la fase de juego"
        });
        return;
      }

      //* Verificar que estemos en la fase de acciones
      if (this.partida.faseJuego !== FaseJuego.ACCIONES) {
        client.send("error", {
          mensajeError: "Debes lanzar los dados primero"
        })
        return;
      }

      //* Obtener el jugador del state y que exista
      const jugador = this.jugadores.get(client.sessionId);
      if (!jugador) return;
      const { h, d, p } = mensaje;

      //* Intentar construir la ciudad
      const resultado = construirCiudad(
        this.tablero.vertices,
        h, d, p,
        jugador, this.banca, client.sessionId
      )

      //* Si no se pudo construir, se notifica el error
      if (resultado.error) {
        client.send("error", {
          mensajeError: resultado.mensaje
        })
        return;
      }

      //* Log de la construccion de la ciudad
      if(!resultado.error){
        this.broadcast("log", {
          jugador: this.jugadores.get(client.sessionId)?.nombre,
          mensaje: resultado.mensaje
        })
      }

      //* Verificar si el jugador ha ganado
      verificarVictoria(this.partida, jugador, client.sessionId, this);
    },


    msgPasarTurno: (client: Client) => {
      //* Verificar que la partida siga en curso
      if (this.partida.fase === FasePartida.FINALIZADA) {
        client.send("error", {
          mensajeError: "La partida ha finalizado"
        });

        return;
      }

      //* Verificar que sea tu turno
      if (this.partida.turnoActual !== client.sessionId) {
        client.send("error", {
          mensajeError: "No es tu turno"
        });

        return;
      }

      //* Solo se puede pasar turno en fase de acciones
      if (this.partida.faseJuego !== FaseJuego.ACCIONES) {
        client.send("error", {
          mensajeError: "Termina de lanzar los dados primero"
        });

        return;
      }

      //* Log de paso de turno
      this.broadcast("log", {
        jugador: this.jugadores.get(client.sessionId)?.nombre,
        mensaje: " ha pasado su turno"
      })

      this.ofertas.clear();

      /** Activar las cartas compradas del jugador */
      activarCartasCompradas(this.jugadores.get(client.sessionId));

      /** Permitir usar una carta en el siguiente turno */
      this.partida.cartaJugable = true;

      //* Cancelar ofertas de intercambio activas
      this.partida.ofertaIntercambio.limpiarOferta()

      siguienteTurno(this.partida);

    },




    msgCartaCaballero: (
      client: Client,
      mensaje: { h: number, d: number }
    ) => {
      //* Verificar que la partida siga en curso
      if (this.partida.fase === FasePartida.FINALIZADA) {
        client.send("error", {
          mensajeError: "La partida ha finalizado"
        })
        return;
      }

      //* Verificar que sea el turno del jugador
      if (this.partida.turnoActual !== client.sessionId) {
        client.send("error", {
          mensajeError: "No es tu turno"
        })
        return;
      }

      //* Verificar si estamos en la fase de acciones
      if (this.partida.faseJuego !== FaseJuego.ACCIONES) {
        client.send("error", {
          mensajeError: "Termina de lanzar los dados primero"
        })
        return;
      }


      //* Verificar que se permita usar carta
      if (!this.partida.cartaJugable) {
        client.send("error", {
          mensajeError: "Solo una carta por turno"
        })
        return;
      }


      //* Verificar que el jugador tenga la carta de caballero
      const jugador = this.jugadores.get(client.sessionId);
      if (jugador.cartas_usables.get(`${Desarrollo.CABALLERO}`) < 1) {
        client.send("error", {
          mensajeError: "No tienes la carta de caballero"
        })
        return;
      }

      //* Mover al ladron y obtener los jugadores involucrados
      const { h, d } = mensaje;
      const resultado = moverLadron(
        this.tablero,
        this.jugadores,
        client.sessionId,
        h, d);


      //* Si no se puede mover el ladron, notificar error
      if (resultado.error) {
        client.send("error", {
          mensajeError: resultado.mensaje
        })
        return;
      }

      //* Log del uso de la carta de caballero
      this.broadcast("log", {
        jugador: this.jugadores.get(client.sessionId)?.nombre,
        mensaje: " ha jugado una carta de caballero"
      })

      //* Eliminar la carta de caballero del jugador
      jugarCaballero(this.jugadores, client.sessionId, this.partida, this); 

      //* Verificar si el jugador ha ganado
      verificarVictoria(this.partida, jugador, client.sessionId, this);
      
      //* Deshabilitar el uso de otra carta este turno
      this.partida.cartaJugable = false;     

      //* Extraemos los jugadores involucrados en el robo
      const jugadoresInvolucrados = resultado.jugadoresInvolucrados;

      //* Si no hay jugadores, pasamos a las ACCIONES
      if (jugadoresInvolucrados.length == 0) {
        this.partida.faseJuego = FaseJuego.ACCIONES;
        return;
      }

      //* Si solo hubo un jugador, se le roba automaticamente
      if (jugadoresInvolucrados.length === 1) {
        robarJugador(
          this.jugadores.get(client.sessionId),
          this.jugadores.get(jugadoresInvolucrados[0])
        )
        this.partida.faseJuego = FaseJuego.ACCIONES;
        return;
      }

      //* Si hay 2 o mas jugadores involucrados, se pasa la lista de jugadores
      this.partida.jugadoresParaRobar.clear();
      this.partida.jugadoresParaRobar.push(...jugadoresInvolucrados);


      //? Entramos a fase especial para decidir a quien robar

      this.partida.faseJuego = FaseJuego.ROBO;
    },

    msgIntercambiarJugador: (
      client: Client,
      mensaje: {
        //* Formato de oferta mixta
        ofrecidos?: Record<string, number>,
        solicitados?: Record<string, number>,
        //* Formato de un recurso por lado (el que manda hoy la pantalla)
        recursoEntregado?: string,
        cantidadEntregada?: number,
        recursoRecibido?: string,
        cantidadRecibida?: number,
      }
    ) => {
      //* Verificar que sea el turno del jugador
      if (this.partida.turnoActual !== client.sessionId) {
        client.send("error", {
          mensajeError: "No es tu turno"
        })
        return;
      }

      // * Verificar que estemos en la fase de acciones
      if (this.partida.faseJuego !== FaseJuego.ACCIONES) {
        client.send("error", {
          mensajeError: "Termina de lanzar los dados primero"
        })
        return;
      }

      // * Verificar que no exista una oferta activa
      if (this.partida.ofertaIntercambio.jugador !== "") {
        client.send("error", {
          mensajeError: "Ya existe una oferta activa"
        })
        return; 
      }

      // * Si llega el formato de un recurso por lado se convierte en oferta mixta
      const ofrecidos = mensaje.ofrecidos ?? { [mensaje.recursoEntregado]: mensaje.cantidadEntregada };
      const solicitados = mensaje.solicitados ?? { [mensaje.recursoRecibido]: mensaje.cantidadRecibida };

      // * Validar y llenar la oferta
      const oferta = this.partida.ofertaIntercambio;
      const resultado = oferta.setOfertaMixta(client.sessionId, this.jugadores, ofrecidos, solicitados);
      if (resultado.error) {
        client.send("error", {
          mensajeError: resultado.mensaje
        })
        return;
      }

      // * La pantalla aun lee los campos de un recurso, se llenan si la oferta es de 1 por lado
      const listaOfrecidos = Object.entries(ofrecidos);
      const listaSolicitados = Object.entries(solicitados);
      if (listaOfrecidos.length === 1 && listaSolicitados.length === 1) {
        [oferta.recursoOfrecido, oferta.cantidadOfrecida] = listaOfrecidos[0];
        [oferta.recursoSolicitado, oferta.cantidadSolicitada] = listaSolicitados[0];
      }

      //* Log de la oferta de intercambio
      this.broadcast("log", {
        jugador: this.jugadores.get(client.sessionId)?.nombre,
        mensaje: " ha hecho una oferta de intercambio"
      })

    },

    msgResponderIntercambio: (
      client: Client,
      mensaje: { respuesta: number }
    ) => {
      // * Verificar que exista una oferta activa
      if (this.partida.ofertaIntercambio.jugador === "") {
        client.send("error", {
          mensajeError: "No hay una oferta activa"
        })
        return;
      }

      // * Verificar que no sea el jugador que la propuso
      if (!this.partida.ofertaIntercambio.respuestas.has(client.sessionId)) {
        client.send("error", {
          mensajeError: "No puedes responde a esta oferta"
        })
        return;
      }

      // * Verificar que el jugador aún deba reponder
      if (this.partida.ofertaIntercambio.respuestas.get(client.sessionId) !== 0) {
        client.send("error", {
          mensajeError: "Ya respondiste a esta oferta"
        })
        return;
      }

      // * Verificar que sea una respueta valida
      if (mensaje.respuesta !== 1 && mensaje.respuesta !== -1) {
        client.send("error", {
          mensajeError: "Respuesta invalida"
        })
        return;
      }

      // ! Rechazo
      if (mensaje.respuesta === -1) {
        this.partida.ofertaIntercambio.registrarRespuesta(client.sessionId, -1);
        //* Log de rechazo de la oferta
        this.broadcast("log", {
          jugador: this.jugadores.get(client.sessionId)?.nombre,
          mensaje: " ha rechazado la oferta de intercambio"
        })

         // * Verificar si todos rechazaron
        if (this.partida.ofertaIntercambio.todosRechazaron()) {
          this.partida.ofertaIntercambio.limpiarOferta();
          this.broadcast("log", {
            jugador: "Sistema: ",
            mensaje: "Todos los jugadores han rechazado la oferta de intercambio"
          });
        }

        return;
      }

      // ? Acepto
      if (mensaje.respuesta === 1) {
        // * Intercambiar los recursos, solo se mueven si ambos tienen lo necesario
        const resultado = intercambiarRecursosMixtos(
          this.partida.ofertaIntercambio.jugador,
          client.sessionId,
          this.jugadores,
          this.partida.ofertaIntercambio
        );

        // * Destruir la ofera si el jugador que propuso ya gastó
        if (resultado.faltaA === "oferente") {
          this.partida.ofertaIntercambio.limpiarOferta();

          client.send("error", {
            mensajeError: "Oferta cancelada, el negociante no tiene ya recursos"
          })

          return;
        }

        // * Si al que acepta le faltan recursos pasa automaticamente a rechazo
        if (resultado.faltaA === "aceptante") {
          this.partida.ofertaIntercambio.registrarRespuesta(client.sessionId, -1);
          // * Verificar si todos rechazaron
          if (this.partida.ofertaIntercambio.todosRechazaron()) {
            this.partida.ofertaIntercambio.limpiarOferta();
          }
          return;
        }

        if (resultado.error) {
          client.send("error", {
            mensajeError: resultado.mensaje
          })
          return;
        }

        //* Log del intercambio de recursos
        this.broadcast("log", {
          jugador: this.jugadores.get(client.sessionId)?.nombre,
          mensaje: " ha aceptado la oferta de intercambio"
        })

        // * Destruir la oferta
        this.partida.ofertaIntercambio.limpiarOferta();
      }
    },

    msgComprarCarta: (client: Client) => {
        //* Verificar que la partida siga en curso
        if(this.partida.fase === FasePartida.FINALIZADA){
            client.send("error", {
                mensajeError: "La partida ha finalizado"
            })
            return;
        }

        //* Verificar que sea el turno del jugador
        if(this.partida.turnoActual !== client.sessionId){
            client.send("error", {
                mensajeError: "No es tu turno"
            })
            return;
        }

        //* Verificar que estamos en fase de acciones
        if(this.partida.faseJuego !== FaseJuego.ACCIONES){
            client.send("error", {
                mensajeError: "Termina de lanzar los dados primero"
            })
            return;
        }

        //* Intentar comprar la carta
        const resultado = comprarCarta(
            this.jugadores.get(client.sessionId), this.banca
        )

        //* Si no se pudo comprar, notificar error
        if(resultado.error){
            client.send("error", {
                mensajeError: resultado.mensaje
            })
            return;    
        }

        //* Log de la compra de la carta
        if(!resultado.error){
            this.broadcast("log", {
                jugador: this.jugadores.get(client.sessionId)?.nombre,
                mensaje: resultado.mensaje
            })
        }

        //* Verificar si el jugador ha ganado
        verificarVictoria(this.partida, this.jugadores.get(client.sessionId), client.sessionId, this);
    },

    msgCartaCarreteras: (client: Client) => {
      // * Verificar que la partida siga en curso
      if (this.partida.fase === FasePartida.FINALIZADA) {
        client.send("error", {
          mensajeError: "La partida ha finalizado"
        })
        return;
      }

      //* Verificar que sea el turno del jugador
      if (this.partida.turnoActual !== client.sessionId) {
        client.send("error", {
          mensajeError: "No es tu turno"
        })
        return;
      }

      //* Verificar que se permita usar carta
      if(!this.partida.cartaJugable){
        client.send("error", {
          mensajeError: "Solo una carta por turno"
        })
        return;
      }

      // * Verificar que estemos en fase de acciones
      if (this.partida.faseJuego !== FaseJuego.ACCIONES) {
        client.send("error", {
          mensajeError: "Termina de lanzar los dados primero"
        })
        return;
      }

      // * Verificar que tenemos la carta usable
      const jugador = this.jugadores.get(client.sessionId);
      if (jugador.cartas_usables.get(`${Desarrollo.CARRETERA}`) < 1) {
        client.send("error", {
          mensajeError: "No tienes la carta de carreteras"
        })
        return;
      }

      // * Eliminar la carta de carreteras del jugador
      jugador.cartas_usables.set(
        `${Desarrollo.CARRETERA}`,
        jugador.cartas_usables.get(`${Desarrollo.CARRETERA}`) - 1
      )

      // * Activar el efeco de la carta de carreteras
      this.partida.carreterasGratis = 2;
      this.partida.faseJuego = FaseJuego.CARRETERAS;

      // * Desactivar el uso de otra carta este turno
      this.partida.cartaJugable = false;

      //* Log de la carta de carreteras
      this.broadcast("log", {
        jugador: this.jugadores.get(client.sessionId)?.nombre,
        mensaje: " ha jugado una carta de carreteras"
      })
    },

    msgCaminoGratis: (
      client: Client,
      mensaje: { h: number, d: number, p: number }
    ) => {
      // * Verificar que la partida siga en curso
      if (this.partida.fase === FasePartida.FINALIZADA) {
        client.send("error", {
          mensajeError: "La partida ha finalizado"
        })
        return;
      }

      // * Verificar que sea el turno del jugador
      if (this.partida.turnoActual !== client.sessionId) {
        client.send("error", {
          mensajeError: "No es tu turno"
        })
        return;
      }

      // * Verificar que estemos en la fase de carretera
      if (this.partida.faseJuego !== FaseJuego.CARRETERAS) {
        client.send("error", {
          mensajeError: "No es la fase de carreteras"
        })
        return;
      }

      // * Obtener al jugador del state y que exista
      const jugador = this.jugadores.get(client.sessionId);
      if (!jugador) return;
      const { h, d, p } = mensaje;

      // * Intentar construir el camino gratis
      const resultado = construirCamino(
        this.tablero.vertices,
        this.tablero.aristas,
        this.partida,
        h, d, p,
        jugador, this.banca, client.sessionId
      )

      // * Si no se pudo construir, se notifica el error
      if (resultado.error && resultado.mensaje !== "No tienes caminos disponibles") {
        client.send("error", {
          mensajeError: resultado.mensaje
        })
        return;
      }

      // * Si el camino se construyo, revisar si cambia quien tiene el camino mas largo
      if (!resultado.error) {
        this.revisarCaminoMasLargo();
      }

      // * Reducir la cantidad de caminos gratis restantes
      this.partida.carreterasGratis -= 1;

      // * Si ya no quedan caminos gratis, volver a fase de acciones
      if (this.partida.carreterasGratis === 0) {
        this.partida.faseJuego = FaseJuego.ACCIONES
      }
    },

    msgCartaAbundancia: (
      client: Client,
      mensaje: { recurso1: string, recurso2: string }
    ) => {
      //* Verificar que la partida siga en curso
      if (this.partida.fase === FasePartida.FINALIZADA) {
        client.send("error", {
          mensajeError: "La partida ha finalizado"
        })
        return;
      }

      //* Verificar que sea el turno del jugador
      if (this.partida.turnoActual !== client.sessionId) {
        client.send("error", {
          mensajeError: "No es tu turno"
        })
        return;
      }

      //* Verificar que estamos en fase de acciones
      if (this.partida.faseJuego !== FaseJuego.ACCIONES) {
        client.send("error", {
          mensajeError: "Termina de lanzar los dados primero"
        })
        return;
      }


      //* Verificar si se permite usar carta
      if (!this.partida.cartaJugable) {
        client.send("error", {
          mensajeError: "solo una carta por turno"
        })
        return;
      }

      //* Verificar que tenga la carta de abundancia
      const jugador = this.jugadores.get(client.sessionId);
      if (jugador.cartas_usables.get(`${Desarrollo.ABUNDANCIA}`) < 1) {
        client.send("error", {
          mensajeError: "No tienes la carta de abundancia"
        })
        return;
      }


      //* Intentar jugar la carta de abundancia
      const resultado = jugarAbundancia(
        jugador, this.banca, mensaje.recurso1, mensaje.recurso2
      );

      //* Si no puede jugar, notificar error
      if (resultado.error) {
        client.send("error", {
          mensajeError: resultado.mensaje
        })
        return;
      }

      //* Log de la carta de abundancia
      if(!resultado.error){
        this.broadcast("log", {
          jugador: this.jugadores.get(client.sessionId)?.nombre,
          mensaje: resultado.mensaje
        })
      }

      //* Marcar que ya se utilizo una carta en este turno
      this.partida.cartaJugable = false;

    },

    msgCartaMonopolio: (
      client: Client,
      mensaje: { recurso: string }
    ) => {
      //* Verificar que la partida siga en curso
      if (this.partida.fase === FasePartida.FINALIZADA) {
        client.send("error", {
          mensajeError: "La partida ha finalizado"
        });
        return;
      }

      //* Verificar que sea el turno del jugador
      if (this.partida.turnoActual !== client.sessionId) {
        client.send("error", {
          mensajeError: "No es tu turno"
        });
        return;
      }

      //* Verificar que estamos en fase de acciones
      if (this.partida.faseJuego !== FaseJuego.ACCIONES) {
        client.send("error", {
          mensajeError: "Termina de lanzar los dados primero"
        });
        return;
      }

      //* Verificar que se permite usar carta
      if (!this.partida.cartaJugable) {
        client.send("error", {
          mensajeError: "Solo una carta por turno"
        });
        return;
      }

      //* Verificar que tenga la carta de monopolio
      const jugador = this.jugadores.get(client.sessionId);

      if (jugador.cartas_usables.get(`${Desarrollo.MONOPOLIO}`) < 1) {
        client.send("error", {
          mensajeError: "No tienes la carta de monopolio"
        });
        return;
      }

      //* Intentar jugar la carta de monopolio
      const resultado = jugarMonopolio(
        this.jugadores,
        client.sessionId,
        mensaje.recurso
      );

      //* Si no se pudo jugar, notificar error
      if (resultado.error) {
        client.send("error", {
          mensajeError: resultado.mensaje
        });
        return;
      }

      //* Log de la carta de monopolio
      if(!resultado.error){
        this.broadcast("log", { 
          jugador: this.jugadores.get(client.sessionId)?.nombre,
          mensaje: resultado.mensaje
        })
      }

      //* Marcar que ya se utilizo una carta en este turno
      this.partida.cartaJugable = false;
    },

    msgRobarJugador: (
      client: Client,
      mensaje: { jugadorRobado: string}
    ) => {
      //* Verificar que la partida siga en curso
      if (this.partida.fase === FasePartida.FINALIZADA) {
        client.send("error", {
          mensajeError: "La partida ha finalizado"
        })
        return;
      }

      //* Verificar que sea el turno del jugador
      if (this.partida.turnoActual !== client.sessionId) {
        client.send("error", {
          mensajeError: "No es tu turno"
        })
        return;
      }

      //* Verificar que estemos en la fase de robar
      if (this.partida.faseJuego !== FaseJuego.ROBO) {
        client.send("error", {
          mensajeError: "No es la fase de robar"
        })
        return;
      }


      //* Verificar que el jugador elegido este en la lista de robo
      if(!this.partida.jugadoresParaRobar.includes(mensaje.jugadorRobado)){
        client.send("error", {
          mensajeError: "El jugador elegido no esta en la lista de robo"
        })
        return;
      }

      //* Robar un recurso al azar al jugador elegido

      robarJugador(this.jugadores.get(client.sessionId), this.jugadores.get(mensaje.jugadorRobado));

      //* Log del robo
      this.broadcast("log", {
        jugador: this.jugadores.get(client.sessionId)?.nombre,
        mensaje: ` ha robado un recurso a ${this.jugadores.get(mensaje.jugadorRobado)?.nombre}`
      })

      //* Limpiar Lista y volver a acciones
      this.partida.jugadoresParaRobar.clear();
      this.partida.faseJuego = FaseJuego.ACCIONES;
    }
    
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

    if(this.partida.fase !== FasePartida.LOBBY){
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
    if(this.partida.fase === FasePartida.JUEGO || FasePartida.PRECONSTRUCCION){
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
      if(eraCreador){
        this.setMetadata({
          ...this.metadata,
          anfitrion: this.jugadores.get(this.partida.creador)?.nombre ?? ""
        })
      }

      //* Si al sacarlo se gana avisar
      if (this.partida.fase === FasePartida.FINALIZADA){
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
    if(this.partida.fase !== FasePartida.LOBBY){
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