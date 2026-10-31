import { useEffect, useRef, useState } from 'react';
import type { Room } from '@colyseus/sdk';
import type { EstadoCatan } from '../tipos/estado';
import type { Propuesta } from '../tipos/partida';
import type { Respuesta } from '../componentes/Comercio/ResponderIntercambio';
import type { Recurso } from '../../../common/jugador';
import { FASE_JUEGO, FASE_PARTIDA } from '../../../common/fases';
import { leerEstado } from '../utils/estado';

interface Opciones {
  sala: Room | null | undefined;
  estado: EstadoCatan | null;
  puedePasarTurno: boolean;
  pasandoTurno: boolean;
}

export function useComercio({ sala, estado, puedePasarTurno, pasandoTurno }: Opciones) {
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

  useEffect(() => {
    if (!sala) return;
    const salaActual = sala;

    function actualizarEstado() {
      const estadoSala = leerEstado(salaActual);

      const pendiente = intercambioPendiente.current;
      if (pendiente) {
        const recursos = estadoSala?.jugadores[salaActual.sessionId]?.recursos;
        
        const intercambioConfirmado = recursos
          && recursos[pendiente.entregado] < pendiente.cantidadEntregada
          && recursos[pendiente.recibido] > pendiente.cantidadRecibida;
          
        const fueraDeAcciones = !estadoSala
          || estadoSala.partida.turnoActual !== salaActual.sessionId
          || estadoSala.partida.fase !== FASE_PARTIDA.JUEGO
          || estadoSala.partida.faseJuego !== FASE_JUEGO.ACCIONES;

        if (intercambioConfirmado || fueraDeAcciones) {
          intercambioPendiente.current = null;
          setIntercambioEnEspera(false);
          setIntercambioAbierto(false);
        }
      }

      if (!estadoSala
        || estadoSala.partida.ofertaIntercambio.jugador === salaActual.sessionId
        || estadoSala.partida.turnoActual !== salaActual.sessionId
        || estadoSala.partida.faseJuego !== FASE_JUEGO.ACCIONES) {
        setPropuestaEnEspera(false);
      }

      if (!estadoSala || estadoSala.partida.ofertaIntercambio.respuestas[salaActual.sessionId] !== 0) {
        setRespuestaEnEspera(false);
      }
    }

    actualizarEstado();
    salaActual.onStateChange(actualizarEstado);

    const dejarDeEscucharErrores = salaActual.onMessage('error', () => {
      setPropuestaEnEspera(false);
      setRespuestaEnEspera(false);
      intercambioPendiente.current = null;
      setIntercambioEnEspera(false);
      setIntercambioAbierto(false);
    });

    return () => {
      salaActual.onStateChange.remove(actualizarEstado);
      dejarDeEscucharErrores();
    };
  }, [sala]);

  const miSessionId = sala?.sessionId ?? '';
  const miJugador = estado?.jugadores[miSessionId];

  const oferta = estado?.partida.ofertaIntercambio;
  const ofertaActiva = 
    oferta 
    && oferta.jugador !== '' 
    && oferta.jugador === estado?.partida.turnoActual ? oferta : null;

  const puedeIntercambiarBanca = puedePasarTurno && !pasandoTurno;

  const puedeProponer = Boolean(
    puedePasarTurno
      && !ofertaActiva
      && miJugador
      && Object.values(miJugador.recursos).some((cantidad) => cantidad > 0),
  );

  const debeResponder = Boolean(
    sala && ofertaActiva && ofertaActiva.respuestas[miSessionId] === 0,
  );

  function intercambiarBanca(entregado: Recurso, recibido: Recurso) {
    const recursos = miJugador?.recursos;

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

  function proponerIntercambio(propuesta: Propuesta) {
    if (!sala || !puedeProponer || propuestaEnEspera) return;
    setPropuestaEnEspera(true);
    sala.send('msgIntercambiarJugador', propuesta);
  }

  function responderIntercambio(respuesta: Respuesta) {
    if (!sala || !debeResponder || respuestaEnEspera) return;
    setRespuestaEnEspera(true);
    sala.send('msgResponderIntercambio', { respuesta });
  }

  return {
    ofertaActiva,
    debeResponder,
    puedeProponer,
    puedeIntercambiarBanca,
    propuestaEnEspera,
    respuestaEnEspera,
    intercambioAbierto,
    intercambioEnEspera,
    abrirIntercambio: () => setIntercambioAbierto(true),
    cerrarIntercambio: () => setIntercambioAbierto(false),
    intercambiarBanca,
    proponerIntercambio,
    responderIntercambio,
  };
}
