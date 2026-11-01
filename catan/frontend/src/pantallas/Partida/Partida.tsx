import { useEffect, useState } from 'react';
import type { Room } from '@colyseus/sdk';
import InfoJugadores from './componentes/InfoJugadores';
import InfoTurno from './componentes/InfoTurno';
import Chat, { type LineaRegistro } from '../../componentes/Chat';
import Existencias from './componentes/Existencias';
import TablaCostes from './componentes/TablaCostes';
import Tablero from './componentes/Tablero/Tablero';
import type { Jugadores } from '../../common/jugador';
import type { EstadoCatan } from './tipos/estado';
import type { Coordenada } from './tipos/tablero';
import CarRecursos from './componentes/CarRecursos';
import CarDesarrollo from './componentes/Cartas/CarDesarrollo';
import IntercambioBanca from './componentes/Comercio/IntercambioBanca';
import DescartarRecursos from './componentes/DescartarRecursos';
import TirarDados from './componentes/TirarDados/TirarDados';
import { reproducirSonido, type NombreSonido } from './utils/sonidos';
import { leerEstado } from './utils/estado';
import { useDadosYTurno } from './hooks/useDadosYTurno';
import { useConstruccion } from './hooks/useConstruccion';
import { useCartas } from './hooks/useCartas';
import { useComercio } from './hooks/useComercio';
import { useLadron } from './hooks/useLadron';
import { useHoraServidor } from './hooks/useHoraServidor';
import { AREA, FONDO_PARTIDA, GRILLA, PANEL } from './utils/layout';
import Construir, {
  type TipoConstruccion,
} from './componentes/Construir/Construir';
import { FASE_JUEGO, FASE_PARTIDA, FASE_PRECONSTRUCCION } from '../../common/fases';
import AvisosTablero from './componentes/AvisosTablero';
import Cronometro from './componentes/Cronometro';
import ElegirRobo from './componentes/ElegirRobo';
import UsarCarta from './componentes/Cartas/UsarCarta';
import ElegirAbundancia from './componentes/Cartas/ElegirAbundancia';
import ElegirMonopolio from './componentes/Cartas/ElegirMonopolio';
import FinPartida from './componentes/FinPartida';
import SalirPartida from './componentes/SalirPartida';
import Ayuda from './componentes/Ayuda/Ayuda';
import ProponerIntercambio from './componentes/Comercio/ProponerIntercambio/ProponerIntercambio';
import ResponderIntercambio from './componentes/Comercio/ResponderIntercambio';

interface Props {
  sala?: Room | null;
  // Lo guarda Navegacion para que sobreviva al paso de la sala de espera a la partida.
  registro: LineaRegistro[];
  // Navegacion borra el token de reconexión y abandona la sala.
  onSalir?: () => void;
}

function Partida({ sala, registro, onSalir }: Props) {
  const [verTableroFinal, setVerTableroFinal] = useState(false);
  // null mientras no llega el estado de la sala.
  const [estadoReal, setEstadoReal] = useState<EstadoCatan | null>(null);

  useEffect(() => {
    if (!sala) return;
    const salaActual = sala;

    function actualizarEstado() {
      setEstadoReal(leerEstado(salaActual));
    }

    actualizarEstado();
    salaActual.onStateChange(actualizarEstado);
    return () => { salaActual.onStateChange.remove(actualizarEstado); };
  }, [sala]);

  useEffect(() => {
    if (!sala) return;
    return sala.onMessage('sonido', ({ nombre }: { nombre: NombreSonido }) => {
      reproducirSonido(nombre);
    });
  }, [sala]);

  const jugadores: Jugadores = estadoReal?.jugadores ?? {};
  const ordenJugadores = estadoReal?.partida.ordenJugadores ?? [];
  const turnoActual = estadoReal?.partida.turnoActual ?? '';
  const miSessionId = sala?.sessionId ?? '';
  const esMiTurno = estadoReal !== null && turnoActual === miSessionId;
  const partidaActual = estadoReal?.partida;
  const miJugadorReal = estadoReal?.jugadores[miSessionId];

  const puedeLanzarDados = Boolean(
    sala
      && esMiTurno
      && estadoReal?.partida.fase === FASE_PARTIDA.JUEGO
      && estadoReal.partida.faseJuego === FASE_JUEGO.DADOS,
  );

  const puedePasarTurno = Boolean(
    sala
      && esMiTurno
      && estadoReal?.partida.fase === FASE_PARTIDA.JUEGO
      && estadoReal.partida.faseJuego === FASE_JUEGO.ACCIONES,
  );

  const { 
    resultadoDados, 
    lanzandoDados, 
    pasandoTurno, 
    lanzarDados, 
    pasarTurno 
  } = useDadosYTurno(sala, puedeLanzarDados, puedePasarTurno);

  const ahoraServidor = useHoraServidor(sala);
  const relojPreconstruccion = partidaActual?.relojes?.preconstruccion;
  const etiquetaReloj = partidaActual?.fasePreconstruccion === FASE_PRECONSTRUCCION.CAMINO
    ? 'Camino'
    : 'Asentamiento';

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

  // En preconstrucción y en carreteras gratis solo se permite la pieza de la fase y no se cobran recursos.
  const enPreconstruccion = Boolean(
    sala && esMiTurno && estadoReal?.partida.fase === FASE_PARTIDA.PRECONSTRUCCION,
  );

  const colocandoCaminosGratis = enFaseCarreteras && esMiTurno;
  const {
    tipoConstruccion,
    objetivoConstruccion,
    caminoGratisEnEspera,
    limpiarConstruccion,
    seleccionarConstruccion,
    seleccionarObjetivo,
  } = useConstruccion(sala, colocandoCaminosGratis, partidaActual?.carreterasGratis ?? 0);

  const {
    compraEnEspera,
    caballero,
    abundancia,
    monopolio,
    cartasUsables,
    menuCartasAbierto,
    puedeComprarCarta,
    puedeUsarCarta,
    abrirMenuCartas,
    cerrarMenuCartas,
    cancelarCaballero,
    cancelarAbundancia,
    cancelarMonopolio,
    comprarCarta,
    elegirCarta,
    jugarCaballero,
    jugarAbundancia,
    jugarMonopolio,
  } = useCartas({ sala, estado: estadoReal, esMiTurno, puedePasarTurno, limpiarConstruccion });

  const {
    descartesPendientes,
    descarteEnEspera,
    moviendoLadron,
    robando,
    esSuTurnoDeDescartar,
    puedeMoverLadron,
    puedeRobar,
    descartarRecurso,
    moverLadron,
    robarJugador,
  } = useLadron({ sala, estado: estadoReal, esMiTurno });

  const {
    ofertaActiva,
    debeResponder,
    puedeProponer,
    puedeIntercambiarBanca,
    propuestaEnEspera,
    respuestaEnEspera,
    intercambioAbierto,
    intercambioEnEspera,
    abrirIntercambio,
    cerrarIntercambio,
    intercambiarBanca,
    proponerIntercambio,
    responderIntercambio,
  } = useComercio({ sala, estado: estadoReal, puedePasarTurno, pasandoTurno });
  
  const tipoPermitido: TipoConstruccion | null = colocandoCaminosGratis
    ? 'camino'
    : !enPreconstruccion
      ? null
      : estadoReal?.partida.fasePreconstruccion === FASE_PRECONSTRUCCION.CAMINO
        ? 'camino'
        : 'poblado';

  const puedeConstruir = enPreconstruccion || puedePasarTurno || colocandoCaminosGratis;

  function seleccionarHexagonoLadron(hexagono: Coordenada) {
    if (caballero === 'eligiendo') jugarCaballero(hexagono);
    else moverLadron(hexagono);
  }

  if (!estadoReal || !miJugadorReal) {
    return <p className="text-center text-body-secondary my-auto">Cargando partida…</p>;
  }

  const { tablero: datosTablero, banca } = estadoReal;

  return (
    <div className="w-100 h-100 d-grid p-2 overflow-hidden" style={GRILLA}>
      <div className="m-2 d-flex gap-2" style={{ gridArea: AREA.salir, alignSelf: 'start', justifySelf: 'start', zIndex: 1 }}>
        <SalirPartida onSalir={() => onSalir?.()} />
        <Ayuda />
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
        <AvisosTablero
          caballero={caballero}
          onCancelarCaballero={cancelarCaballero}
          nombreGanador={partidaFinalizada && verTableroFinal ? nombreGanador : null}
          enFaseCarreteras={enFaseCarreteras}
          esMiTurno={esMiTurno}
          carreterasGratis={partidaActual?.carreterasGratis ?? 0}
          nombreJugadorEnTurno={jugadores[turnoActual]?.nombre ?? 'El jugador en turno'}
        />
        <Cronometro
          etiqueta={etiquetaReloj}
          fin={relojPreconstruccion?.fin ?? null}
          ahora={ahoraServidor}
        />
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
          onUsarCarta={abrirMenuCartas}
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
              onAbrir={abrirIntercambio}
              onCerrar={cerrarIntercambio}
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
        onCerrar={cerrarMenuCartas}
      />
      {/* Se monta al elegir la carta para que cada uso empiece con el diálogo vacío. */}
      {abundancia !== null && (
        <ElegirAbundancia
          abierto
          enviando={typeof abundancia === 'number'}
          recursosBanca={banca.recursos}
          onCerrar={cancelarAbundancia}
          onConfirmar={jugarAbundancia}
        />
      )}
      {monopolio !== null && (
        <ElegirMonopolio
          abierto
          enviando={typeof monopolio === 'number'}
          misRecursos={miJugadorReal.recursos}
          onCerrar={cancelarMonopolio}
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
