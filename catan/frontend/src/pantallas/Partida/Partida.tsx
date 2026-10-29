import { useEffect, useRef, useState } from 'react';
import type { Room } from '@colyseus/sdk';
import InfoJugadores from './componentes/InfoJugadores';
import InfoTurno from './componentes/InfoTurno';
import Chat, { type LineaRegistro } from '../../componentes/Chat';
import Existencias from './componentes/Existencias';
import TablaCostes from './componentes/TablaCostes';
import Tablero from './componentes/Tablero/Tablero';
import type { Jugadores, Recurso } from '../../common/jugador';
import { CARTA } from '../../common/jugador';
import type { EstadoCatan } from './tipos/estado';
import type { Coordenada } from './tipos/tablero';
import CarRecursos from './componentes/CarRecursos';
import CarDesarrollo from './componentes/Cartas/CarDesarrollo';
import IntercambioBanca from './componentes/Comercio/IntercambioBanca';
import DescartarRecursos from './componentes/DescartarRecursos';
import TirarDados, { type ResultadoDados } from './componentes/TirarDados/TirarDados';
import { reproducirSonido, type NombreSonido } from './utils/sonidos';
import { leerEstado } from './utils/estado';
import { MENSAJE_CONSTRUIR } from './utils/construccion';
import { AREA, FONDO_PARTIDA, GRILLA, PANEL } from './utils/layout';
import Construir, {
  type ObjetivoConstruccion,
  type SolicitudConstruccion,
  type TipoConstruccion,
} from './componentes/Construir/Construir';
import { FASE_JUEGO, FASE_PARTIDA, FASE_PRECONSTRUCCION } from '../../common/fases';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import ElegirRobo from './componentes/ElegirRobo';
import UsarCarta, { type CartaUsable } from './componentes/Cartas/UsarCarta';
import ElegirAbundancia from './componentes/Cartas/ElegirAbundancia';
import ElegirMonopolio from './componentes/Cartas/ElegirMonopolio';
import FinPartida from './componentes/FinPartida';
import SalirPartida from './componentes/SalirPartida';
import ProponerIntercambio from './componentes/Comercio/ProponerIntercambio/ProponerIntercambio';
import type { Propuesta } from './tipos/partida';
import ResponderIntercambio, { type Respuesta } from './componentes/Comercio/ResponderIntercambio';

interface Props {
  sala?: Room | null;
  // Lo guarda Navegacion para que sobreviva al paso de la sala de espera a la partida.
  registro: LineaRegistro[];
  onSolicitarConstruccion?: (solicitud: SolicitudConstruccion) => void;
  // Navegacion borra el token de reconexión y abandona la sala.
  onSalir?: () => void;
}

function Partida({ sala, registro, onSolicitarConstruccion, onSalir }: Props) {
  const [tipoConstruccion, setTipoConstruccion] = useState<TipoConstruccion | null>(null);
  const [objetivoConstruccion, setObjetivoConstruccion] = useState<ObjetivoConstruccion | null>(null);
  const [resultadoDados, setResultadoDados] = useState<ResultadoDados | null>(null);
  const [lanzandoDados, setLanzandoDados] = useState(false);
  const [pasandoTurno, setPasandoTurno] = useState(false);
  const [descarteEnEspera, setDescarteEnEspera] = useState<number | null>(null);
  const [moviendoLadron, setMoviendoLadron] = useState(false);
  const [compraEnEspera, setCompraEnEspera] = useState<number | null>(null);
  const [robando, setRobando] = useState(false);
  const [menuCartasAbierto, setMenuCartasAbierto] = useState(false);
  const [verTableroFinal, setVerTableroFinal] = useState(false);
  // Cartas con diálogo: null = sin usar; 'eligiendo' = el jugador elige; número = mensaje enviado
  // (cuántas cartas usables tenía, para saber cuándo el servidor lo confirma).
  const [caballero, setCaballero] = useState<null | 'eligiendo' | number>(null);
  const [abundancia, setAbundancia] = useState<null | 'eligiendo' | number>(null);
  const [monopolio, setMonopolio] = useState<null | 'eligiendo' | number>(null);
  // Carreteras no tiene diálogo: null o el número de cartas usables al enviar el mensaje.
  const [carreterasEnEspera, setCarreterasEnEspera] = useState<number | null>(null);
  // Caminos gratis que quedaban al enviar msgCaminoGratis; se libera cuando el servidor descuenta uno.
  const [caminoGratisEnEspera, setCaminoGratisEnEspera] = useState<number | null>(null);
  const modoCaminosGratis = useRef(false);
  const [propuestaEnEspera, setPropuestaEnEspera] = useState(false);
  const [respuestaEnEspera, setRespuestaEnEspera] = useState(false);
  const [intercambioAbierto, setIntercambioAbierto] = useState(false);
  const [intercambioEnEspera, setIntercambioEnEspera] = useState(false);
  const intercambioPendiente = useRef<{
    entregado: Recurso;
    recibido: Recurso;
    cantidadEntregada: number;
    cantidadRecibida: number;
  } | null>(null);
  // null mientras no llega el estado de la sala.
  const [estadoReal, setEstadoReal] = useState<EstadoCatan | null>(null);

  useEffect(() => {
    if (!sala) return;
    const salaActual = sala;

    function actualizarEstado() {
      const estado = leerEstado(salaActual);
      setEstadoReal(estado);
      // El intercambio no tiene confirmacion propia: se refleja en los recursos.
      const pendiente = intercambioPendiente.current;
      if (pendiente) {
        const recursos = estado?.jugadores[salaActual.sessionId]?.recursos;
        const intercambioConfirmado = recursos
          && recursos[pendiente.entregado] < pendiente.cantidadEntregada
          && recursos[pendiente.recibido] > pendiente.cantidadRecibida;
        const fueraDeAcciones = !estado
          || estado.partida.turnoActual !== salaActual.sessionId
          || estado.partida.fase !== FASE_PARTIDA.JUEGO
          || estado.partida.faseJuego !== FASE_JUEGO.ACCIONES;
        if (intercambioConfirmado || fueraDeAcciones) {
          intercambioPendiente.current = null;
          setIntercambioEnEspera(false);
          setIntercambioAbierto(false);
        }
      }
      // Cada descarte aceptado reduce la cuenta del servidor.
      setDescarteEnEspera((cantidadAnterior) => {
        if (cantidadAnterior === null) return null;
        const partida = estado?.partida;
        const restantes = partida?.jugadoresParaDescartar[salaActual.sessionId] ?? 0;
        return !partida || partida.faseJuego !== FASE_JUEGO.DESCARTE || restantes < cantidadAnterior
          ? null
          : cantidadAnterior;
      });
      // La compra se confirma cuando el servidor reduce el mazo de la banca.
      setCompraEnEspera((cartasAnteriores) => {
        if (cartasAnteriores === null) return null;
        return !estado
          || estado.partida.turnoActual !== salaActual.sessionId
          || estado.partida.faseJuego !== FASE_JUEGO.ACCIONES
          || estado.banca.cartas.length < cartasAnteriores
          ? null
          : cartasAnteriores;
      });
      if (!estado
        || estado.partida.turnoActual !== salaActual.sessionId
        || estado.partida.fase !== FASE_PARTIDA.JUEGO
        || estado.partida.faseJuego !== FASE_JUEGO.ACCIONES) {
        setPasandoTurno(false);
      }
      // Al mover al ladron el backend cambia la fase (Acciones o Robo).
      if (!estado || estado.partida.faseJuego !== FASE_JUEGO.LADRON) {
        setMoviendoLadron(false);
      }

      if(!estado || estado.partida.faseJuego !== FASE_JUEGO.ROBO){
        setRobando(false);
      }

      // Se confirma cuando el servidor resta la carta; si cambia el turno o la fase, se cancela.
      setCaballero((anterior) => {
        if (anterior === null) return null;
        const usables = estado?.jugadores[salaActual.sessionId]?.cartas_usables[CARTA.CABALLERO] ?? 0;
        if (!estado || estado.partida.turnoActual !== salaActual.sessionId) return null;
        if (typeof anterior === 'number') return usables < anterior ? null : anterior;
        return estado.partida.faseJuego === FASE_JUEGO.ACCIONES ? anterior : null;
      });

      // La propuesta se confirma cuando aparece en el estado como mía.
      if (!estado
        || estado.partida.ofertaIntercambio.jugador === salaActual.sessionId
        || estado.partida.turnoActual !== salaActual.sessionId
        || estado.partida.faseJuego !== FASE_JUEGO.ACCIONES) {
        setPropuestaEnEspera(false);
      }

      // Se confirma cuando el backend deja de tenerme como pendiente (0): respondí o borró la oferta.
      // Al borrarla "respuestas" queda vacío (undefined): no usar "?? 0" o nunca se liberaría.
      if (!estado || estado.partida.ofertaIntercambio.respuestas[salaActual.sessionId] !== 0) {
        setRespuestaEnEspera(false);
      }

      setAbundancia((anterior) => {
        if (anterior === null) return null;
        if (!estado || estado.partida.turnoActual !== salaActual.sessionId) return null;
        const usables = estado.jugadores[salaActual.sessionId]?.cartas_usables[CARTA.ABUNDANCIA] ?? 0;
        if (typeof anterior === 'number') return usables < anterior ? null : anterior;
        return estado.partida.faseJuego === FASE_JUEGO.ACCIONES ? anterior : null;
      });

      setMonopolio((anterior) => {
        if (anterior === null) return null;
        if (!estado || estado.partida.turnoActual !== salaActual.sessionId) return null;
        const usables = estado.jugadores[salaActual.sessionId]?.cartas_usables[CARTA.MONOPOLIO] ?? 0;
        if (typeof anterior === 'number') return usables < anterior ? null : anterior;
        return estado.partida.faseJuego === FASE_JUEGO.ACCIONES ? anterior : null;
      });

      // Se confirma cuando el servidor resta la carta y pasa la fase a CARRETERAS.
      setCarreterasEnEspera((anterior) => {
        if (anterior === null) return null;
        if (!estado || estado.partida.turnoActual !== salaActual.sessionId) return null;
        const usables = estado.jugadores[salaActual.sessionId]?.cartas_usables[CARTA.CARRETERAS] ?? 0;
        return estado.partida.faseJuego === FASE_JUEGO.CARRETERAS || usables < anterior ? null : anterior;
      });

      // Al entrar a la fase CARRETERAS en mi turno se activa solo el modo "camino"; al volver a ACCIONES se desactiva.
      const colocandoGratis = Boolean(estado
        && estado.partida.turnoActual === salaActual.sessionId
        && estado.partida.fase === FASE_PARTIDA.JUEGO
        && estado.partida.faseJuego === FASE_JUEGO.CARRETERAS);
      if (colocandoGratis !== modoCaminosGratis.current) {
        modoCaminosGratis.current = colocandoGratis;
        setTipoConstruccion(colocandoGratis ? 'camino' : null);
        setObjetivoConstruccion(null);
      }
      setCaminoGratisEnEspera((anterior) => {
        if (anterior === null) return null;
        if (!colocandoGratis || !estado || estado.partida.carreterasGratis < anterior) return null;
        return anterior;
      });

    }

    actualizarEstado();

    salaActual.onStateChange(actualizarEstado);
    return () => { salaActual.onStateChange.remove(actualizarEstado); };
  }, [sala]);

  useEffect(() => {
    if (!sala) return;

    // Se transmite a todos los jugadores, incluido quien lanzó.
    const dejarDeEscucharDados = sala.onMessage('dados', (resultado: ResultadoDados) => {
      setResultadoDados(resultado);
      setLanzandoDados(false);
      reproducirSonido('dados');
    });

    const dejarDeEscucharSonidos = sala.onMessage('sonido', ({ nombre }: { nombre: NombreSonido }) => {
      reproducirSonido(nombre);
    });

    // Navegacion ya muestra el error; aquí solo se liberan los botones.
    const dejarDeEscucharErrores = sala.onMessage('error', () => {
      setLanzandoDados(false);
      setPasandoTurno(false);
      setDescarteEnEspera(null);
      setMoviendoLadron(false);
      setCompraEnEspera(null);
      setRobando(false);
      setPropuestaEnEspera(false);
      setRespuestaEnEspera(false);
      // Si el servidor rechaza una carta, se vuelve a elegir.
      setCaballero((anterior) => (typeof anterior === 'number' ? 'eligiendo' : anterior));
      setAbundancia((anterior) => (typeof anterior === 'number' ? 'eligiendo' : anterior));
      setMonopolio((anterior) => (typeof anterior === 'number' ? 'eligiendo' : anterior));
      setCarreterasEnEspera(null);
      setCaminoGratisEnEspera(null);
      intercambioPendiente.current = null;
      setIntercambioEnEspera(false);
      setIntercambioAbierto(false);
    });

    return () => {
      dejarDeEscucharDados();
      dejarDeEscucharErrores();
      dejarDeEscucharSonidos();
    };
  }, [sala]);

  const jugadores: Jugadores = estadoReal?.jugadores ?? {};
  const ordenJugadores = estadoReal?.partida.ordenJugadores ?? [];
  const turnoActual = estadoReal?.partida.turnoActual ?? '';
  const miSessionId = sala?.sessionId ?? '';
  const esMiTurno = estadoReal !== null && turnoActual === miSessionId;
  const partidaActual = estadoReal?.partida;
  const miJugadorReal = estadoReal?.jugadores[miSessionId];
  const descartesPendientes = partidaActual?.jugadoresParaDescartar[miSessionId] ?? 0;
  
  const esSuTurnoDeDescartar = Boolean(
    sala
      && partidaActual?.fase === FASE_PARTIDA.JUEGO
      && partidaActual.faseJuego === FASE_JUEGO.DESCARTE
      && descartesPendientes > 0,
  );
  const puedeLanzarDados = Boolean(
    sala
      && esMiTurno
      && estadoReal?.partida.fase === FASE_PARTIDA.JUEGO
      && estadoReal.partida.faseJuego === FASE_JUEGO.DADOS,
  );
  const puedeMoverLadron = Boolean(
    sala
      && esMiTurno
      && estadoReal?.partida.fase === FASE_PARTIDA.JUEGO
      && estadoReal.partida.faseJuego === FASE_JUEGO.LADRON,
  );

  const puedeRobar = Boolean(
    sala
    && esMiTurno
    && estadoReal?.partida.fase === FASE_PARTIDA.JUEGO
    && estadoReal.partida.faseJuego === FASE_JUEGO.ROBO
  );

  const puedePasarTurno = Boolean(
    sala
      && esMiTurno
      && estadoReal?.partida.fase === FASE_PARTIDA.JUEGO
      && estadoReal.partida.faseJuego === FASE_JUEGO.ACCIONES,
  );
  const puedeIntercambiarBanca = puedePasarTurno && !pasandoTurno;
  const puedeComprarCarta = Boolean(
    sala
      && esMiTurno
      && partidaActual?.fase === FASE_PARTIDA.JUEGO
      && partidaActual.faseJuego === FASE_JUEGO.ACCIONES
      && (estadoReal?.banca.cartas.length ?? 0) > 0
      && (miJugadorReal?.recursos.trigo ?? 0) >= 1
      && (miJugadorReal?.recursos.lana ?? 0) >= 1
      && (miJugadorReal?.recursos.mineral ?? 0) >= 1,
  );

  // Las 4 cartas que se pueden jugar (el punto de victoria no se juega).
  const cartasUsables = miJugadorReal?.cartas_usables;
  const tieneCartaUsable = Boolean(cartasUsables && (
    cartasUsables[CARTA.CABALLERO] + cartasUsables[CARTA.CARRETERAS]
      + cartasUsables[CARTA.ABUNDANCIA] + cartasUsables[CARTA.MONOPOLIO] > 0
  ));
  // El backend permite una carta por turno y solo en la fase de acciones.
  const puedeUsarCarta = Boolean(
    puedePasarTurno
      && partidaActual?.cartaJugable
      && tieneCartaUsable
      && caballero === null
      && abundancia === null
      && monopolio === null
      && carreterasEnEspera === null,
  );

  // Con la partida finalizada solo funciona Salir: las demás acciones dependen de la fase JUEGO.
  const partidaFinalizada = Boolean(
    sala
      && partidaActual?.fase === FASE_PARTIDA.FINALIZADA
      && partidaActual.ganador !== '',
  );
  const nombreGanador = partidaActual?.ganador
    ? (jugadores[partidaActual.ganador]?.nombre ?? 'Un jugador')
    : '';

  const enFaseCarreteras = Boolean(
    sala
      && partidaActual?.fase === FASE_PARTIDA.JUEGO
      && partidaActual.faseJuego === FASE_JUEGO.CARRETERAS,
  );

  // Solo cuenta si es del jugador en turno (el backend la borra al pasar el turno).
  const oferta = partidaActual?.ofertaIntercambio;
  const ofertaActiva = oferta && oferta.jugador !== '' && oferta.jugador === turnoActual ? oferta : null;
  const puedeProponer = Boolean(
    puedePasarTurno
      && !ofertaActiva
      && miJugadorReal
      && Object.values(miJugadorReal.recursos).some((cantidad) => cantidad > 0),
  );
  // Me toca responder si el backend me tiene como pendiente (0) en la oferta.
  const debeResponder = Boolean(
    sala && ofertaActiva && ofertaActiva.respuestas[miSessionId] === 0,
  );

  // En preconstrucción y en carreteras gratis solo se permite la pieza de la fase y no se cobran recursos.
  const enPreconstruccion = Boolean(
    sala && esMiTurno && estadoReal?.partida.fase === FASE_PARTIDA.PRECONSTRUCCION,
  );
  const colocandoCaminosGratis = enFaseCarreteras && esMiTurno;
  const tipoPermitido: TipoConstruccion | null = colocandoCaminosGratis
    ? 'camino'
    : !enPreconstruccion
      ? null
      : estadoReal?.partida.fasePreconstruccion === FASE_PRECONSTRUCCION.CAMINO
        ? 'camino'
        : 'poblado';

  const puedeConstruir = enPreconstruccion || puedePasarTurno || colocandoCaminosGratis;

  function pasarTurno() {
    if (!sala || !puedePasarTurno || pasandoTurno) return;
    setPasandoTurno(true);
    sala.send('msgPasarTurno');
  }

  function comprarCarta() {
    if (!sala || !puedeComprarCarta || compraEnEspera !== null) return;
    setCompraEnEspera(estadoReal?.banca.cartas.length ?? 0);
    sala.send('msgComprarCarta');
  }

  function intercambiarBanca(entregado: Recurso, recibido: Recurso) {
    const recursos = miJugadorReal?.recursos;
    if (!sala || !puedeIntercambiarBanca || intercambioPendiente.current
      || !recursos || entregado === recibido) return;
    intercambioPendiente.current = {
      entregado,
      recibido,
      cantidadEntregada: recursos[entregado],
      cantidadRecibida: recursos[recibido],
    };
    setIntercambioEnEspera(true);
    sala.send('msgIntercambiarBanca', { recursoEntregado: entregado, recursoRecibido: recibido });
  }

  function descartarRecurso(recurso: Recurso) {
    const disponibles = estadoReal?.jugadores[miSessionId]?.recursos[recurso] ?? 0;
    if (!sala || !esSuTurnoDeDescartar || descarteEnEspera !== null || disponibles < 1) return;
    setDescarteEnEspera(descartesPendientes);
    sala.send('msgDescartarRecursos', { recurso });
  }

  function lanzarDados() {
    if (!sala || !puedeLanzarDados || lanzandoDados) return;
    setLanzandoDados(true);
    sala.send('msgLanzarDados');
  }

  function moverLadron(hexagono: Coordenada) {
    // Mientras responde se ocultan los círculos para no mandar el mensaje dos veces.
    if (!sala || !puedeMoverLadron || moviendoLadron) return;
    setMoviendoLadron(true);
    sala.send('msgMoverLadron', { h: hexagono.h, d: hexagono.d });
  }

  function robarJugador(jugadorRobado: string) {
    if (!sala || !puedeRobar || robando) return;
    setRobando(true);
    sala.send('msgRobarJugador', { jugadorRobado });
  }

  function proponerIntercambio(propuesta: Propuesta) {
    if (!sala || !puedeProponer || propuestaEnEspera) return;
    setPropuestaEnEspera(true);
    sala.send('msgIntercambiarJugador', propuesta);
  }

  function responderIntercambio(respuesta: Respuesta) {
    // Si acepto sin tener lo que se pide, el backend lo cambia a -1.
    if (!sala || !debeResponder || respuestaEnEspera) return;
    setRespuestaEnEspera(true);
    sala.send('msgResponderIntercambio', { respuesta });
  }

  function elegirCarta(carta: CartaUsable) {
    setMenuCartasAbierto(false);
    if (carta === CARTA.CABALLERO) {
      // Se reutilizan los circulos de mover al ladron para elegir el hexagono.
      setTipoConstruccion(null);
      setCaballero('eligiendo');
    } else if (carta === CARTA.ABUNDANCIA) {
      setAbundancia('eligiendo');
    } else if (carta === CARTA.MONOPOLIO) {
      setMonopolio('eligiendo');
    } else if (carta === CARTA.CARRETERAS) {
      activarCarreteras();
    }
  }

  function activarCarreteras() {
    // Se quita cualquier construcción elegida para que no queden aristas o vértices activos.
    if (!sala || carreterasEnEspera !== null) return;
    setTipoConstruccion(null);
    setObjetivoConstruccion(null);
    setCarreterasEnEspera(cartasUsables?.[CARTA.CARRETERAS] ?? 0);
    sala.send('msgCartaCarreteras');
  }

  function jugarMonopolio(recurso: Recurso) {
    if (!sala || monopolio !== 'eligiendo') return;
    setMonopolio(cartasUsables?.[CARTA.MONOPOLIO] ?? 0);
    sala.send('msgCartaMonopolio', { recurso });
  }

  function jugarAbundancia(recurso1: Recurso, recurso2: Recurso) {
    if (!sala || abundancia !== 'eligiendo') return;
    setAbundancia(cartasUsables?.[CARTA.ABUNDANCIA] ?? 0);
    sala.send('msgCartaAbundancia', { recurso1, recurso2 });
  }

  function jugarCaballero(hexagono: Coordenada) {
    if (!sala || caballero !== 'eligiendo') return;
    setCaballero(cartasUsables?.[CARTA.CABALLERO] ?? 0);
    sala.send('msgCartaCaballero', { h: hexagono.h, d: hexagono.d });
  }

  function seleccionarHexagonoLadron(hexagono: Coordenada) {
    if (caballero === 'eligiendo') jugarCaballero(hexagono);
    else moverLadron(hexagono);
  }

  function seleccionarConstruccion(tipo: TipoConstruccion | null) {
    setTipoConstruccion(tipo);
    // Un objetivo elegido para una pieza no se puede reutilizar para otra.
    setObjetivoConstruccion(null);
  }

  function seleccionarObjetivo(objetivo: ObjetivoConstruccion) {
    if (!tipoConstruccion) return;

    // Camino gratis: se envía con msgCaminoGratis y el modo camino sigue activo para el siguiente.
    if (sala && colocandoCaminosGratis && tipoConstruccion === 'camino') {
      if (caminoGratisEnEspera !== null) return;
      setObjetivoConstruccion(objetivo);
      setCaminoGratisEnEspera(partidaActual?.carreterasGratis ?? 0);
      sala.send('msgCaminoGratis', objetivo);
      return;
    }

    setObjetivoConstruccion(objetivo);

    // El backend confirma por el estado, no manda mensaje de éxito.
    const mensaje = MENSAJE_CONSTRUIR[tipoConstruccion];
    if (sala && mensaje) {
      sala.send(mensaje, objetivo);
      setTipoConstruccion(null);
      return;
    }

    const solicitud: SolicitudConstruccion = { tipo: tipoConstruccion, objetivo };

    onSolicitarConstruccion?.(solicitud);
  }

  if (!estadoReal || !miJugadorReal) {
    return <p className="text-center text-body-secondary my-auto">Cargando partida…</p>;
  }

  const { tablero: datosTablero, banca } = estadoReal;

  return (
    <div className="w-100 h-100 d-grid p-2 overflow-hidden" style={GRILLA}>
        <div className="m-2" style={{ gridArea: AREA.salir, alignSelf: 'start', justifySelf: 'start', zIndex: 1 }}>
          <SalirPartida onSalir={() => onSalir?.()} />
        </div>
        <div className={PANEL} style={{ gridArea: AREA.tabCostos }}>
            <TablaCostes />
        </div>
        <div className={PANEL} style={{ gridArea: AREA.chat }}>
          <Chat
            registro={registro}
            onEnviar={sala ? (mensaje) => sala.send('msgChat', { mensaje }) : undefined}
          />
        </div>
        <div className={PANEL} style={{ gridArea: AREA.construir }}>
          <Construir
            recursos={miJugadorReal.recursos}
            esMiTurno={esMiTurno}
            puedeConstruir={puedeConstruir}
            tipoPermitido={tipoPermitido}
            seleccion={tipoConstruccion}
            onSeleccionar={seleccionarConstruccion}
          />
        </div>
        <div className="overflow-hidden" style={{ gridArea: AREA.infoJugadores }}>
          <InfoJugadores
            jugadores={jugadores}
            ordenJugadores={ordenJugadores}
            miSessionId={miSessionId}
            ejercitoMasGrande={partidaActual?.ejercitoMasGrande ?? ''}
            caminoMasLargo={partidaActual?.caminoMasLargo ?? ''}
          />
        </div>
        <div
          className="overflow-hidden border border-5 border-white"
          style={{ position: 'relative', gridArea: AREA.tablero, backgroundColor: FONDO_PARTIDA }}
        >
          {caballero !== null && (
            <Alert
              severity="info"
              sx={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}
              action={caballero === 'eligiendo' && (
                <Button color="inherit" size="small" onClick={() => setCaballero(null)}>
                  Cancelar
                </Button>
              )}
            >
              {caballero === 'eligiendo'
                ? 'Caballero: elige a qué hexágono mover al ladrón.'
                : 'Usando caballero…'}
            </Alert>
          )}
          {partidaFinalizada && verTableroFinal && (
            <Alert
              severity="success"
              sx={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}
            >
              Partida finalizada: ganó <strong>{nombreGanador}</strong>. Usa "Salir" para dejar la sala.
            </Alert>
          )}
          {enFaseCarreteras && (
            <Alert
              severity="warning"
              sx={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}
            >
              {esMiTurno
                ? `Construcción de carreteras: elige una arista para colocar un camino gratis (te quedan ${partidaActual?.carreterasGratis ?? 0}). El resto de acciones está bloqueado.`
                : `${jugadores[turnoActual]?.nombre ?? 'El jugador en turno'} está usando Construcción de carreteras.`}
            </Alert>
          )}
          <Tablero
            datos={datosTablero}
            jugadores={jugadores}
            miSessionId={miSessionId}
            // Mientras se envía un camino gratis se ocultan las aristas para no gastar los dos con un doble clic.
            tipoConstruccion={caminoGratisEnEspera !== null ? null : tipoConstruccion}
            objetivoSeleccionado={objetivoConstruccion}
            onSeleccionarObjetivo={seleccionarObjetivo}
            moviendoLadron={(puedeMoverLadron && !moviendoLadron) || caballero === 'eligiendo'}
            onSeleccionarHexagonoLadron={seleccionarHexagonoLadron}
          />
          <div className="position-absolute bottom-0 end-0 m-2" style={{ zIndex: 1 }}>
            <TirarDados
              resultado={resultadoDados}
              puedeLanzar={puedeLanzarDados}
              lanzando={lanzandoDados}
              onLanzar={lanzarDados}
              puedePasarTurno={puedePasarTurno}
              pasandoTurno={pasandoTurno}
              onPasarTurno={pasarTurno}
              insignia={<InfoTurno sessionIdTurno={turnoActual} jugadores={jugadores} />}
            />
          </div>
        </div>
        <div className={PANEL} style={{ gridArea: AREA.carRecursos }}>
          <CarRecursos miJugador={jugadores[miSessionId]} />
        </div>
        <div className={PANEL} style={{ gridArea: AREA.carDesarrollo }}>
          <CarDesarrollo
            miJugador={jugadores[miSessionId]}
            puedeComprar={puedeComprarCarta}
            comprando={compraEnEspera !== null}
            onComprar={comprarCarta}
            puedeUsarCarta={puedeUsarCarta}
            onUsarCarta={() => setMenuCartasAbierto(true)}
          />
        </div>
        <div className={PANEL} style={{ gridArea: AREA.negociar }}>
          {/* Quien debe responder ve la propuesta; al responder vuelve el recuadro de proponer. */}
          {debeResponder && ofertaActiva ? (
            <ResponderIntercambio
              oferta={ofertaActiva}
              nombreOferente={jugadores[ofertaActiva.jugador]?.nombre ?? 'Un jugador'}
              misRecursos={miJugadorReal?.recursos}
              enviando={respuestaEnEspera}
              onResponder={responderIntercambio}
            />
          ) : (
            <ProponerIntercambio
              ofertaActiva={ofertaActiva}
              jugadores={jugadores}
              misRecursos={miJugadorReal?.recursos}
              puedeProponer={puedeProponer}
              enviando={propuestaEnEspera}
              onProponer={proponerIntercambio}
            >
              <IntercambioBanca
                abierto={intercambioAbierto}
                puedeIntercambiar={puedeIntercambiarBanca}
                enviando={intercambioEnEspera}
                recursosJugador={miJugadorReal.recursos}
                recursosBanca={banca.recursos}
                onAbrir={() => setIntercambioAbierto(true)}
                onCerrar={() => setIntercambioAbierto(false)}
                onConfirmar={intercambiarBanca}
              />
            </ProponerIntercambio>
          )}
        </div>
        <div className={PANEL} style={{ gridArea: AREA.existencias }}>
          <Existencias
            banca={banca}
            miJugador={jugadores[miSessionId]}
          />
        </div>
        <DescartarRecursos
          pendientes={descartesPendientes}
          recursos={estadoReal?.jugadores[miSessionId]?.recursos}
          esSuTurnoDeDescartar={esSuTurnoDeDescartar}
          enviando={descarteEnEspera !== null}
          onDescartar={descartarRecurso}
        />
          <ElegirRobo
          abierto={puedeRobar}
          jugadoresParaRobar={partidaActual?.jugadoresParaRobar ?? []}
          jugadores={jugadores}
          enviando={robando}
          onRobar={robarJugador}
        />
        <UsarCarta
          abierto={menuCartasAbierto && puedeUsarCarta}
          cartasUsables={cartasUsables}
          onElegir={elegirCarta}
          onCerrar={() => setMenuCartasAbierto(false)}
        />
        {/* Se monta al elegir la carta para que cada uso empiece con el diálogo vacío. */}
        {abundancia !== null && (
          <ElegirAbundancia
            abierto
            enviando={typeof abundancia === 'number'}
            recursosBanca={banca.recursos}
            onCerrar={() => setAbundancia(null)}
            onConfirmar={jugarAbundancia}
          />
        )}
        {monopolio !== null && (
          <ElegirMonopolio
            abierto
            enviando={typeof monopolio === 'number'}
            misRecursos={miJugadorReal.recursos}
            onCerrar={() => setMonopolio(null)}
            onConfirmar={jugarMonopolio}
          />
        )}
        <FinPartida
          abierto={partidaFinalizada && !verTableroFinal}
          nombreGanador={nombreGanador}
          soyElGanador={partidaActual?.ganador === miSessionId}
          ganador={partidaActual?.ganador ?? ''}
          jugadores={jugadores}
          onSalir={() => onSalir?.()}
          onVerTablero={() => setVerTableroFinal(true)}
        />

    </div>
  );
}

export default Partida;
