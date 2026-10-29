import { useEffect, useRef, useState } from 'react';
import type { Room } from '@colyseus/sdk';
import InfoJugadores from './componentes/InfoJugadores';
import InfoTurno from './componentes/InfoTurno';
import Chat, { type LineaRegistro } from '../../componentes/Chat';
import { bancaPrueba } from '../../datos/bancaPruebas';
import Existencias from './componentes/Existencias';
import { tableroPrueba } from '../../datos/tableroPrueba'
import TablaCostes from './componentes/TablaCostes';
import Tablero from './componentes/Tablero/Tablero';
import type { Jugadores, Recurso, Recursos } from '../../common/jugador';
import { CARTA } from '../../common/jugador';
import type { EstadoCatan } from './tipos/estado';
import type { Coordenada } from './tipos/tablero';
import CarRecursos from './componentes/CarRecursos';
import CarDesarrollo from './componentes/Cartas/CarDesarrollo';
import IntercambioBanca from './componentes/Comercio/IntercambioBanca';
import DescartarRecursos from './componentes/DescartarRecursos';
import TirarDados, { type ResultadoDados } from './componentes/TirarDados/TirarDados';
import { reproducirSonido, type NombreSonido } from './utils/sonidos';
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
import ProponerIntercambio from './componentes/Comercio/ProponerIntercambio/ProponerIntercambio';
import type { Propuesta } from './tipos/partida';
import ResponderIntercambio, { type Respuesta } from './componentes/Comercio/ResponderIntercambio';

// Fondo azul de la partida, el mismo del tablero
const FONDO_PARTIDA = '#C5CFD6';

// Grilla de 6 columnas y 4 filas en la que se acomoda cada panel
const GRILLA = {
  gridTemplateColumns: 'repeat(6, 1fr)',
  gridTemplateRows: '0.8fr 3.5fr 4fr 3fr',
  gap: 5,
  backgroundColor: FONDO_PARTIDA,
} as const;

// Lugar de cada panel: fila inicial / columna inicial / fila final / columna final
const AREA = {
  salir: '1 / 1 / 2 / 2',
  tabCostos: '2 / 1 / 3 / 2',
  chat: '2 / 6 / 4 / 7',
  construir: '4 / 1 / 5 / 2',
  carRecursos: '4 / 2 / 5 / 3',
  carDesarrollo: '4 / 3 / 5 / 4',
  negociar: '4 / 4 / 5 / 5',
  tirDado: '4 / 5 / 5 / 6',
  finTurno: '4 / 6 / 5 / 7',
  existencias: '3 / 1 / 4 / 2',
  infoJugadores: '1 / 2 / 2 / 7',
  tablero: '2 / 2 / 4 / 6',
} as const;

// Los paneles son recuadros blancos; el tablero y la info de jugadores van sin fondo
const PANEL = 'overflow-hidden bg-white rounded-3';

const recursosPrueba: Recursos = {
  madera: 2,
  ladrillo: 2,
  lana: 1,
  trigo: 2,
  mineral: 3,
};

//Mensajes de construccion
const MENSAJE_CONSTRUIR: Partial<Record<TipoConstruccion, string>> = {
  poblado: 'msgColocarAsentamiento',
  camino: 'msgColocarCamino',
  ciudad: 'msgColocarCiudad',
};

/* room.state es un Schema de Colyseus: toJSON() lo vuelve objeto plano. Las
   claves son las mismas que en common/ (h, d, p, terreno, constuccion, nombre,
   recursos, cartas_usables...), asi que no hay nada que traducir.
   Devuelve null mientras el estado no haya llegado completo. */
function leerEstado(sala: Room): EstadoCatan | null {
  const raiz = sala.state as { toJSON?: () => EstadoCatan } | undefined;
  if (!raiz?.toJSON) return null;
  const estado = raiz.toJSON();
  if (!estado.tablero || !estado.jugadores || !estado.partida || !estado.banca) return null;
  return estado;
}

interface Props {
  // Si no hay sala de Colyseus, usara el tableroPrueba
  sala?: Room | null;
  // Historial de chat y log; lo guarda Navegacion para que sobreviva al paso
  // de la sala de espera a la partida.
  registro: LineaRegistro[];
  // La capa de conexión inyectará aquí una función equivalente a:
  // room.send('construir', solicitud).
  // Así esta pantalla no crea una segunda conexión al backend.
  onSolicitarConstruccion?: (solicitud: SolicitudConstruccion) => void;
  // Navegacion borra el token de reconexión y abandona la sala.
  onSalir?: () => void;
}

// Pantalla principal de la partida. Contiene todos los componentes de la partida.
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
  // true cuando el jugador cierra el modal de fin de partida con "Ver tablero".
  const [verTableroFinal, setVerTableroFinal] = useState(false);
  /* Carta de caballero: null = no se esta usando; 'eligiendo' = el jugador
     elige el hexagono del ladron; un numero = mensaje enviado, guarda cuantos
     caballeros usables tenia para saber cuando el servidor lo confirma. */
  const [caballero, setCaballero] = useState<null | 'eligiendo' | number>(null);
  /* Carta de abundancia, igual que el caballero: null = no se usa; 'eligiendo'
     = dialogo abierto para elegir los 2 recursos; un numero = mensaje enviado,
     guarda cuantas abundancias usables tenia para saber cuando se confirma. */
  const [abundancia, setAbundancia] = useState<null | 'eligiendo' | number>(null);
  // Carta de monopolio: mismos estados que la abundancia.
  const [monopolio, setMonopolio] = useState<null | 'eligiendo' | number>(null);
  /* Carta de carreteras: no tiene dialogo, se activa al elegirla. null = no
     se esta activando; un numero = mensaje enviado, guarda cuantas cartas de
     carreteras usables tenia para saber cuando el servidor lo confirma. */
  const [carreterasEnEspera, setCarreterasEnEspera] = useState<number | null>(null);
  /* Caminos gratis (fase CARRETERAS): numero de caminos gratis que quedaban al
     enviar msgCaminoGratis; se libera cuando el servidor lo descuenta. */
  const [caminoGratisEnEspera, setCaminoGratisEnEspera] = useState<number | null>(null);
  // true mientras se esta en la fase CARRETERAS en mi turno (modo camino activo).
  const modoCaminosGratis = useRef(false);
  // true desde que se envia la propuesta hasta que el servidor la publica.
  const [propuestaEnEspera, setPropuestaEnEspera] = useState(false);
  // true desde que se responde la propuesta hasta que el servidor lo registra.
  const [respuestaEnEspera, setRespuestaEnEspera] = useState(false);
  const [intercambioAbierto, setIntercambioAbierto] = useState(false);
  const [intercambioEnEspera, setIntercambioEnEspera] = useState(false);
  const intercambioPendiente = useRef<{
    entregado: Recurso;
    recibido: Recurso;
    cantidadEntregada: number;
    cantidadRecibida: number;
  } | null>(null);
  // Todo lo que manda el servidor. null = todavia no llega, o no hay sala.
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
      // Cada descarte aceptado reduce la cuenta publicada por el servidor.
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
      // El servidor confirma el cambio mediante el estado, no un mensaje nuevo.
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

      // El caballero se confirma cuando el servidor le resta la carta al
      // jugador. Si cambia el turno o la fase, se cancela.
      setCaballero((anterior) => {
        if (anterior === null) return null;
        const usables = estado?.jugadores[salaActual.sessionId]?.cartas_usables[CARTA.CABALLERO] ?? 0;
        if (!estado || estado.partida.turnoActual !== salaActual.sessionId) return null;
        if (typeof anterior === 'number') return usables < anterior ? null : anterior;
        return estado.partida.faseJuego === FASE_JUEGO.ACCIONES ? anterior : null;
      });

      // La propuesta se confirma cuando aparece en el estado como mia.
      if (!estado
        || estado.partida.ofertaIntercambio.jugador === salaActual.sessionId
        || estado.partida.turnoActual !== salaActual.sessionId
        || estado.partida.faseJuego !== FASE_JUEGO.ACCIONES) {
        setPropuestaEnEspera(false);
      }

      /* La respuesta se confirma cuando el backend deja de tenerme como
         pendiente: respondi (1 o -1) o borro la oferta. Al borrarla vacia
         "respuestas", asi que mi clave no existe (undefined) y tambien libera.
         Ojo: no usar "?? 0", porque undefined pasaria a 0 y nunca se liberaria. */
      if (!estado || estado.partida.ofertaIntercambio.respuestas[salaActual.sessionId] !== 0) {
        setRespuestaEnEspera(false);
      }

      // La abundancia se confirma cuando el servidor le resta la carta al
      // jugador. Si cambia el turno o la fase, se cancela.
      setAbundancia((anterior) => {
        if (anterior === null) return null;
        if (!estado || estado.partida.turnoActual !== salaActual.sessionId) return null;
        const usables = estado.jugadores[salaActual.sessionId]?.cartas_usables[CARTA.ABUNDANCIA] ?? 0;
        if (typeof anterior === 'number') return usables < anterior ? null : anterior;
        return estado.partida.faseJuego === FASE_JUEGO.ACCIONES ? anterior : null;
      });

      // El monopolio se confirma igual: cuando el servidor le resta la carta.
      setMonopolio((anterior) => {
        if (anterior === null) return null;
        if (!estado || estado.partida.turnoActual !== salaActual.sessionId) return null;
        const usables = estado.jugadores[salaActual.sessionId]?.cartas_usables[CARTA.MONOPOLIO] ?? 0;
        if (typeof anterior === 'number') return usables < anterior ? null : anterior;
        return estado.partida.faseJuego === FASE_JUEGO.ACCIONES ? anterior : null;
      });

      // La carta de carreteras se confirma cuando el servidor la resta y pasa
      // la fase a CARRETERAS. Si cambia el turno, se olvida.
      setCarreterasEnEspera((anterior) => {
        if (anterior === null) return null;
        if (!estado || estado.partida.turnoActual !== salaActual.sessionId) return null;
        const usables = estado.jugadores[salaActual.sessionId]?.cartas_usables[CARTA.CARRETERAS] ?? 0;
        return estado.partida.faseJuego === FASE_JUEGO.CARRETERAS || usables < anterior ? null : anterior;
      });

      /* Caminos gratis: al entrar a la fase CARRETERAS en mi turno se activa
         solo el modo "camino" (se ven las aristas para elegir); al salir (el
         backend vuelve a ACCIONES tras el ultimo camino) se desactiva. */
      const colocandoGratis = Boolean(estado
        && estado.partida.turnoActual === salaActual.sessionId
        && estado.partida.fase === FASE_PARTIDA.JUEGO
        && estado.partida.faseJuego === FASE_JUEGO.CARRETERAS);
      if (colocandoGratis !== modoCaminosGratis.current) {
        modoCaminosGratis.current = colocandoGratis;
        setTipoConstruccion(colocandoGratis ? 'camino' : null);
        setObjetivoConstruccion(null);
      }
      // Cada camino gratis se confirma cuando el servidor descuenta uno.
      setCaminoGratisEnEspera((anterior) => {
        if (anterior === null) return null;
        if (!colocandoGratis || !estado || estado.partida.carreterasGratis < anterior) return null;
        return anterior;
      });

    }

    actualizarEstado();

    // Se vuelve a leer con cada cambio que mande el servidor.
    salaActual.onStateChange(actualizarEstado);
    return () => { salaActual.onStateChange.remove(actualizarEstado); };
  }, [sala]);

  useEffect(() => {
    if (!sala) return;

    // CatanRoom transmite este evento a todos los jugadores, incluido quien
    // lanzó. Por eso el mismo resultado se ve en todas las pantallas.
    const dejarDeEscucharDados = sala.onMessage('dados', (resultado: ResultadoDados) => {
      setResultadoDados(resultado);
      setLanzandoDados(false);
      reproducirSonido('dados');
    });

    const dejarDeEscucharSonidos = sala.onMessage('sonido', ({ nombre }: { nombre: NombreSonido }) => {
      reproducirSonido(nombre);
    });

    // CatanRoom responde "error" al cliente si una validación falla. El
    // navegador ya muestra ese mensaje desde Navegacion; aquí solo liberamos
    // los botones para que la interfaz no quede bloqueada tras el rechazo.
    const dejarDeEscucharErrores = sala.onMessage('error', () => {
      setLanzandoDados(false);
      setPasandoTurno(false);
      setDescarteEnEspera(null);
      setMoviendoLadron(false);
      setCompraEnEspera(null);
      setRobando(false);
      setPropuestaEnEspera(false);
      setRespuestaEnEspera(false);
      // Si el servidor rechaza el caballero, se puede elegir otro hexagono.
      setCaballero((anterior) => (typeof anterior === 'number' ? 'eligiendo' : anterior));
      // Si el servidor rechaza la abundancia, el dialogo sigue abierto para corregir.
      setAbundancia((anterior) => (typeof anterior === 'number' ? 'eligiendo' : anterior));
      // Igual con el monopolio: el dialogo sigue abierto para elegir otro recurso.
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

  /* Sin sala, o antes del primer estado, los jugadores, el orden y el turno
     quedan vacios; solo el tablero y la banca usan datos de prueba. */
  const datosTablero = estadoReal?.tablero ?? tableroPrueba;
  const jugadores: Jugadores = estadoReal?.jugadores ?? {};
  const ordenJugadores = estadoReal?.partida.ordenJugadores ?? [];
  const turnoActual = estadoReal?.partida.turnoActual ?? '';
  const banca = estadoReal?.banca ?? bancaPrueba;
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
  // Se llega aqui tras sacar 7 o despues de que todos terminen de descartar.
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

  /* Fase CARRETERAS (carta de construccion de carreteras). Todas las acciones
     de la vista dependen de la fase ACCIONES (o DADOS), asi que en esta fase
     quedan bloqueadas solas; aqui solo se avisa en que fase esta la partida.
     Colocar los caminos gratis es la siguiente issue (msgCaminoGratis). */
  /* Fin del juego: el backend pone partida.ganador y la fase FINALIZADA.
     Todas las acciones dependen de la fase JUEGO, asi que ya quedan
     bloqueadas; solo sigue funcionando el boton Salir. */
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

  /* Propuesta de intercambio activa. Solo cuenta si es del jugador en turno
     (el backend la borra al pasar el turno; esto es solo por seguridad). */
  const oferta = partidaActual?.ofertaIntercambio;
  const ofertaActiva = oferta && oferta.jugador !== '' && oferta.jugador === turnoActual ? oferta : null;
  // Mi turno, fase de acciones, sin otra propuesta activa y con algo que ofrecer.
  const puedeProponer = Boolean(
    puedePasarTurno
      && !ofertaActiva
      && miJugadorReal
      && Object.values(miJugadorReal.recursos).some((cantidad) => cantidad > 0),
  );
  /* Me toca responder si el backend me tiene como pendiente (0) en la oferta.
     Al responder (1 o -1) o al cerrarse la oferta, deja de cumplirse. */
  const debeResponder = Boolean(
    sala && ofertaActiva && ofertaActiva.respuestas[miSessionId] === 0,
  );

  /* Preconstruccion: el backend solo acepta la pieza de la subfase en curso y
     no cobra recursos.*/
  const enPreconstruccion = Boolean(
    sala && esMiTurno && estadoReal?.partida.fase === FASE_PARTIDA.PRECONSTRUCCION,
  );
  /* Fase CARRETERAS en mi turno: igual que en la preconstruccion, solo se
     permite el camino y no se cobran recursos (lo valida el backend). */
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
    // El backend elige al siguiente jugador. No adelantamos el turno localmente.
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
    // El backend vuelve a validar turno y fase; esta condición solo evita un
    // clic inválido en la interfaz y bloquea repeticiones mientras responde.
    if (!sala || !puedeLanzarDados || lanzandoDados) return;
    setLanzandoDados(true);
    sala.send('msgLanzarDados');
  }

  function moverLadron(hexagono: Coordenada) {
    // El backend valida turno, fase y que no sea el mismo hexagono, y luego
    // cambia la fase a Acciones o a Robo. Mientras responde, se ocultan los
    // circulos para no mandar dos veces el mensaje.
    if (!sala || !puedeMoverLadron || moviendoLadron) return;
    setMoviendoLadron(true);
    sala.send('msgMoverLadron', { h: hexagono.h, d: hexagono.d });
  }

  function robarJugador(jugadorRobado: string) {
    // El backend valida que este en jugadoresParaRobar, roba y pasa a Acciones.
    if (!sala || !puedeRobar || robando) return;
    setRobando(true);
    sala.send('msgRobarJugador', { jugadorRobado });
  }

  function proponerIntercambio(propuesta: Propuesta) {
    // El backend valida turno, fase y recursos y publica la oferta en
    // partida.ofertaIntercambio; con eso la ven todos los jugadores.
    if (!sala || !puedeProponer || propuestaEnEspera) return;
    setPropuestaEnEspera(true);
    sala.send('msgIntercambiarJugador', propuesta);
  }

  function responderIntercambio(respuesta: Respuesta) {
    // El backend valida; si acepto sin tener lo que se pide, lo cambia a -1.
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
    // No pide datos: el backend valida, resta la carta, da 2 caminos gratis y
    // pasa la fase a CARRETERAS. Se quita cualquier construccion elegida para
    // que no queden aristas o vertices activos en el tablero.
    if (!sala || carreterasEnEspera !== null) return;
    setTipoConstruccion(null);
    setObjetivoConstruccion(null);
    setCarreterasEnEspera(cartasUsables?.[CARTA.CARRETERAS] ?? 0);
    sala.send('msgCartaCarreteras');
  }

  function jugarMonopolio(recurso: Recurso) {
    // El backend valida turno, fase, la carta y el recurso, y le pasa al
    // jugador todo lo que los demas tengan de ese recurso.
    if (!sala || monopolio !== 'eligiendo') return;
    setMonopolio(cartasUsables?.[CARTA.MONOPOLIO] ?? 0);
    sala.send('msgCartaMonopolio', { recurso });
  }

  function jugarAbundancia(recurso1: Recurso, recurso2: Recurso) {
    // El backend valida turno, fase, la carta y que la banca tenga los recursos.
    if (!sala || abundancia !== 'eligiendo') return;
    setAbundancia(cartasUsables?.[CARTA.ABUNDANCIA] ?? 0);
    sala.send('msgCartaAbundancia', { recurso1, recurso2 });
  }

  function jugarCaballero(hexagono: Coordenada) {
    // El backend valida turno, fase, la carta y el hexagono. Si hay 2 o mas
    // jugadores para robar pasa a la fase de Robo y se abre ElegirRobo.
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

    /* Camino gratis: misma eleccion de arista, pero con msgCaminoGratis y el
       mismo JSON { h, d, p }. El modo camino sigue activo para el siguiente;
       el backend vuelve a ACCIONES al terminar los caminos gratis. */
    if (sala && colocandoCaminosGratis && tipoConstruccion === 'camino') {
      if (caminoGratisEnEspera !== null) return;
      setObjetivoConstruccion(objetivo);
      setCaminoGratisEnEspera(partidaActual?.carreterasGratis ?? 0);
      sala.send('msgCaminoGratis', objetivo);
      return;
    }

    setObjetivoConstruccion(objetivo);

    // El backend valida turno, fase, recursos y posicion, y confirma por el
    // estado: no manda ningun mensaje de exito.
    const mensaje = MENSAJE_CONSTRUIR[tipoConstruccion];
    if (sala && mensaje) {
      sala.send(mensaje, objetivo);
      setTipoConstruccion(null);
      return;
    }

    const solicitud: SolicitudConstruccion = { tipo: tipoConstruccion, objetivo };

    // La validación definitiva (turno, recursos, legalidad y propiedad) vive
    // en CatanRoom. Este callback será conectado por la issue de integración.
    onSolicitarConstruccion?.(solicitud);
  }

  return (
    <div className="w-100 h-100 d-grid p-2 overflow-hidden" style={GRILLA}>
        <div className={PANEL} style={{ gridArea: AREA.salir }}>
          <button className="btn btn-danger w-100 h-100" onClick={onSalir}>Salir</button>
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
            recursos={jugadores[miSessionId]?.recursos ?? recursosPrueba}
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
          {/* Tras "Ver tablero": aviso fijo de que la partida termino. */}
          {partidaFinalizada && verTableroFinal && (
            <Alert
              severity="success"
              sx={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}
            >
              Partida finalizada: ganó <strong>{nombreGanador}</strong>. Usa "Salir" para dejar la sala.
            </Alert>
          )}
          {/* Aviso de la fase CARRETERAS para todos los jugadores. */}
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
            // Mientras se envia un camino gratis se ocultan las aristas: evita
            // mandar dos y gastar los dos caminos con un doble clic.
            tipoConstruccion={caminoGratisEnEspera !== null ? null : tipoConstruccion}
            objetivoSeleccionado={objetivoConstruccion}
            onSeleccionarObjetivo={seleccionarObjetivo}
            moviendoLadron={(puedeMoverLadron && !moviendoLadron) || caballero === 'eligiendo'}
            onSeleccionarHexagonoLadron={seleccionarHexagonoLadron}
          />
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
          {/* A quien le falta responder ve la propuesta con los botones de rechazar y aceptar; al responder
              vuelve el recuadro normal de proponer (con el intercambio con la banca). */}
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
                recursosJugador={jugadores[miSessionId]?.recursos ?? recursosPrueba}
                recursosBanca={banca.recursos}
                onAbrir={() => setIntercambioAbierto(true)}
                onCerrar={() => setIntercambioAbierto(false)}
                onConfirmar={intercambiarBanca}
              />
            </ProponerIntercambio>
          )}
        </div>
        <div className={PANEL} style={{ gridArea: AREA.tirDado }}>
          <TirarDados
            resultado={resultadoDados}
            puedeLanzar={puedeLanzarDados}
            lanzando={lanzandoDados}
            onLanzar={lanzarDados}
          />
        </div>
        <div className={`${PANEL} d-flex flex-column gap-1 p-1`} style={{ gridArea: AREA.finTurno }}>
          <InfoTurno
            sessionIdTurno={turnoActual}
            jugadores={jugadores}
          />
          <Button
            className="flex-fill"
            type="button"
            variant="contained"
            fullWidth
            disabled={!puedePasarTurno || pasandoTurno}
            onClick={pasarTurno}
          >
            {pasandoTurno ? 'Pasando turno…' : 'Pasar turno'}
          </Button>
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
        {/* Se monta al elegir la carta, asi cada uso empieza con el dialogo vacio. */}
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
            misRecursos={jugadores[miSessionId]?.recursos ?? recursosPrueba}
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
