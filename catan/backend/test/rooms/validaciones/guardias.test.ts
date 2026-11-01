import { describe, it } from "mocha";
import assert from "node:assert";
import { Partida } from "../../../src/schemas/Partida.js";
import { Jugador } from "../../../src/schemas/Jugador.js";
import { Desarrollo, FaseJuego, FasePartida, FasePreconstruccion } from "../../../src/common/enums.js";
import {
  type Guardia,
  aunNoRespondio,
  hayOfertaActiva,
  puedeResponderOferta,
  respuestaValida,
  sinOfertaActiva,
  debeDescartar,
  enFaseJuego,
  enFasePartida,
  enFasePreconstruccion,
  esCreador,
  esSuTurno,
  jugadorRobable,
  partidaEnCurso,
  puedeUsarCarta,
  tieneCarta,
  validar
} from "../../../src/rooms/validaciones/guardias.js";

const ANGEL = "jugadorAngel";
const ALAN = "jugadorAlan";

//? Funcion que devuelve una partida de prueba en la fase de juego y con el turno de Angel
function armarPartida() {
  const partida = new Partida();
  partida.creador = ANGEL;
  partida.turnoActual = ANGEL;
  partida.fase = FasePartida.JUEGO;
  partida.faseJuego = FaseJuego.ACCIONES;
  return partida;
}

describe("guardias de partida y turno", () => {

  it("partidaEnCurso no da error mientras se juega", () => {
    const partida = armarPartida();

    assert.strictEqual(partidaEnCurso({ partida, sessionId: ANGEL }), null);
  });

  it("partidaEnCurso da error si la partida ya finalizo", () => {
    const partida = armarPartida();
    partida.fase = FasePartida.FINALIZADA;

    assert.strictEqual(partidaEnCurso({ partida, sessionId: ANGEL }), "La partida ha finalizado");
  });

  it("esSuTurno no da error si es el turno del jugador", () => {
    const partida = armarPartida();

    assert.strictEqual(esSuTurno({ partida, sessionId: ANGEL }), null);
  });

  it("esSuTurno da error si el turno es de otro jugador", () => {
    const partida = armarPartida();

    assert.strictEqual(esSuTurno({ partida, sessionId: ALAN }), "No es tu turno");
  });

  it("esCreador no da error si el jugador creo la sala", () => {
    const partida = armarPartida();

    assert.strictEqual(esCreador({ partida, sessionId: ANGEL }), null);
  });

  it("esCreador da error si el jugador no creo la sala", () => {
    const partida = armarPartida();

    assert.notStrictEqual(esCreador({ partida, sessionId: ALAN }), null);
  });

  it("enFasePartida no da error si la partida esta en esa fase", () => {
    const partida = armarPartida();

    assert.strictEqual(enFasePartida(FasePartida.JUEGO)({ partida, sessionId: ANGEL }), null);
  });

  it("enFasePartida da error si la partida esta en otra fase", () => {
    const partida = armarPartida();
    partida.fase = FasePartida.PRECONSTRUCCION;

    assert.notStrictEqual(enFasePartida(FasePartida.JUEGO)({ partida, sessionId: ANGEL }), null);
  });

  it("enFaseJuego no da error si el juego esta en esa fase", () => {
    const partida = armarPartida();

    assert.strictEqual(enFaseJuego(FaseJuego.ACCIONES)({ partida, sessionId: ANGEL }), null);
  });

  it("enFaseJuego da error si aun no se lanzaron los dados", () => {
    const partida = armarPartida();
    partida.faseJuego = FaseJuego.DADOS;

    assert.strictEqual(
      enFaseJuego(FaseJuego.ACCIONES)({ partida, sessionId: ANGEL }),
      "Debes lanzar los dados primero"
    );
  });

  it("enFaseJuego da error si ya se lanzaron los dados", () => {
    const partida = armarPartida();

    assert.strictEqual(
      enFaseJuego(FaseJuego.DADOS)({ partida, sessionId: ANGEL }),
      "Ya lanzaste los dados"
    );
  });

});

describe("guardias de cartas", () => {

  it("puedeUsarCarta no da error si aun no se uso una carta en el turno", () => {
    const partida = armarPartida();
    partida.cartaJugable = true;

    assert.strictEqual(puedeUsarCarta({ partida, sessionId: ANGEL }), null);
  });

  it("puedeUsarCarta da error si ya se uso una carta en el turno", () => {
    const partida = armarPartida();
    partida.cartaJugable = false;

    assert.strictEqual(puedeUsarCarta({ partida, sessionId: ANGEL }), "Solo una carta por turno");
  });

  it("tieneCarta no da error si el jugador tiene la carta", () => {
    const partida = armarPartida();
    const jugador = new Jugador("Angel");
    jugador.cartas_usables.set(`${Desarrollo.CABALLERO}`, 1);

    assert.strictEqual(tieneCarta(Desarrollo.CABALLERO)({ partida, sessionId: ANGEL, jugador }), null);
  });

  it("tieneCarta da error si el jugador no tiene la carta", () => {
    const partida = armarPartida();
    const jugador = new Jugador("Angel");
    jugador.cartas_usables.set(`${Desarrollo.CABALLERO}`, 0);

    assert.strictEqual(
      tieneCarta(Desarrollo.CABALLERO)({ partida, sessionId: ANGEL, jugador }),
      "No tienes la carta de caballero"
    );
  });

  it("tieneCarta indica de cual carta se trata en el error", () => {
    const partida = armarPartida();
    const jugador = new Jugador("Angel");
    jugador.cartas_usables.set(`${Desarrollo.MONOPOLIO}`, 0);

    assert.strictEqual(
      tieneCarta(Desarrollo.MONOPOLIO)({ partida, sessionId: ANGEL, jugador }),
      "No tienes la carta de monopolio"
    );
  });

  it("tieneCarta da error si no se encontro al jugador", () => {
    const partida = armarPartida();

    assert.notStrictEqual(tieneCarta(Desarrollo.CABALLERO)({ partida, sessionId: ANGEL }), null);
  });

});

describe("validar", () => {

  it("no da error si no hay ninguna guardia", () => {
    const partida = armarPartida();

    assert.strictEqual(validar({ partida, sessionId: ANGEL }, []), null);
  });

  it("no da error si todas las guardias pasan", () => {
    const partida = armarPartida();

    const error = validar(
      { partida, sessionId: ANGEL },
      [partidaEnCurso, esSuTurno, enFaseJuego(FaseJuego.ACCIONES)]
    );

    assert.strictEqual(error, null);
  });

  it("devuelve el error de la guardia que falla", () => {
    const partida = armarPartida();

    const error = validar(
      { partida, sessionId: ALAN },
      [partidaEnCurso, esSuTurno, enFaseJuego(FaseJuego.ACCIONES)]
    );

    assert.strictEqual(error, "No es tu turno");
  });

  it("devuelve el error de la primera guardia si fallan varias", () => {
    const partida = armarPartida();
    partida.fase = FasePartida.FINALIZADA;

    const error = validar(
      { partida, sessionId: ALAN },
      [partidaEnCurso, esSuTurno]
    );

    assert.strictEqual(error, "La partida ha finalizado");
  });

  it("no revisa las guardias siguientes despues de un error", () => {
    const partida = armarPartida();
    let revisadas = 0;
    const siempreFalla: Guardia = () => "Fallo";
    const contadora: Guardia = () => {
      revisadas++;
      return null;
    };

    validar({ partida, sessionId: ANGEL }, [siempreFalla, contadora]);

    assert.strictEqual(revisadas, 0);
  });

});

describe("guardia de preconstruccion", () => {

  it("enFasePreconstruccion no da error si es el paso esperado", () => {
    const partida = armarPartida();
    partida.fasePreconstruccion = FasePreconstruccion.ASENTAMIENTO;

    assert.strictEqual(
      enFasePreconstruccion(FasePreconstruccion.ASENTAMIENTO)({ partida, sessionId: ANGEL }),
      null
    );
  });

  it("enFasePreconstruccion avisa que falta el camino si se espera un asentamiento", () => {
    const partida = armarPartida();
    partida.fasePreconstruccion = FasePreconstruccion.CAMINO;

    assert.strictEqual(
      enFasePreconstruccion(FasePreconstruccion.ASENTAMIENTO)({ partida, sessionId: ANGEL }),
      "Debes colocar un camino"
    );
  });

  it("enFasePreconstruccion avisa que falta el asentamiento si se espera un camino", () => {
    const partida = armarPartida();
    partida.fasePreconstruccion = FasePreconstruccion.ASENTAMIENTO;

    assert.strictEqual(
      enFasePreconstruccion(FasePreconstruccion.CAMINO)({ partida, sessionId: ANGEL }),
      "Coloca primero un asentamiento"
    );
  });

});

describe("guardia de descarte", () => {

  it("debeDescartar no da error si el jugador esta en la lista de descarte", () => {
    const partida = armarPartida();
    partida.jugadoresParaDescartar.set(ANGEL, 4);

    assert.strictEqual(debeDescartar({ partida, sessionId: ANGEL }), null);
  });

  it("debeDescartar da error si el jugador no esta en la lista de descarte", () => {
    const partida = armarPartida();
    partida.jugadoresParaDescartar.set(ALAN, 4);

    assert.strictEqual(debeDescartar({ partida, sessionId: ANGEL }), "No tienes que descartar");
  });

});

describe("guardia de robo", () => {

  it("jugadorRobable no da error si el jugador esta en la lista de robo", () => {
    const partida = armarPartida();
    partida.jugadoresParaRobar.push(ALAN);

    assert.strictEqual(jugadorRobable(ALAN)({ partida, sessionId: ANGEL }), null);
  });

  it("jugadorRobable da error si el jugador no esta en la lista de robo", () => {
    const partida = armarPartida();
    partida.jugadoresParaRobar.push(ALAN);

    assert.strictEqual(
      jugadorRobable("otroJugador")({ partida, sessionId: ANGEL }),
      "El jugador elegido no esta en la lista de robo"
    );
  });

});

describe("guardias de ofertas de intercambio", () => {

  it("sinOfertaActiva no da error si no hay oferta", () => {
    const partida = armarPartida();

    assert.strictEqual(sinOfertaActiva({ partida, sessionId: ANGEL }), null);
  });

  it("sinOfertaActiva da error si ya hay una oferta activa", () => {
    const partida = armarPartida();
    partida.ofertaIntercambio.jugador = ANGEL;

    assert.strictEqual(sinOfertaActiva({ partida, sessionId: ANGEL }), "Ya existe una oferta activa");
  });

  it("hayOfertaActiva no da error si hay una oferta", () => {
    const partida = armarPartida();
    partida.ofertaIntercambio.jugador = ANGEL;

    assert.strictEqual(hayOfertaActiva({ partida, sessionId: ALAN }), null);
  });

  it("hayOfertaActiva da error si no hay oferta", () => {
    const partida = armarPartida();

    assert.strictEqual(hayOfertaActiva({ partida, sessionId: ALAN }), "No hay una oferta activa");
  });

  it("puedeResponderOferta no da error a quien debe responder", () => {
    const partida = armarPartida();
    partida.ofertaIntercambio.respuestas.set(ALAN, 0);

    assert.strictEqual(puedeResponderOferta({ partida, sessionId: ALAN }), null);
  });

  it("puedeResponderOferta da error a quien no esta en las respuestas, como quien ofrece", () => {
    const partida = armarPartida();
    partida.ofertaIntercambio.respuestas.set(ALAN, 0);

    assert.strictEqual(
      puedeResponderOferta({ partida, sessionId: ANGEL }),
      "No puedes responder a esta oferta"
    );
  });

  it("aunNoRespondio no da error si la respuesta sigue pendiente", () => {
    const partida = armarPartida();
    partida.ofertaIntercambio.respuestas.set(ALAN, 0);

    assert.strictEqual(aunNoRespondio({ partida, sessionId: ALAN }), null);
  });

  it("aunNoRespondio da error si ya acepto o rechazo", () => {
    const partida = armarPartida();
    partida.ofertaIntercambio.respuestas.set(ALAN, -1);

    assert.strictEqual(aunNoRespondio({ partida, sessionId: ALAN }), "Ya respondiste a esta oferta");
  });

  it("respuestaValida acepta 1 y -1", () => {
    const partida = armarPartida();

    assert.strictEqual(respuestaValida(1)({ partida, sessionId: ALAN }), null);
    assert.strictEqual(respuestaValida(-1)({ partida, sessionId: ALAN }), null);
  });

  it("respuestaValida da error con cualquier otro valor", () => {
    const partida = armarPartida();

    assert.strictEqual(respuestaValida(0)({ partida, sessionId: ALAN }), "Respuesta invalida");
    assert.strictEqual(respuestaValida(5)({ partida, sessionId: ALAN }), "Respuesta invalida");
  });

});
