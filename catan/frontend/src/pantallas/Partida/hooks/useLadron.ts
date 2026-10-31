import { useEffect, useState } from 'react';
import type { Room } from '@colyseus/sdk';
import type { EstadoCatan } from '../tipos/estado';
import type { Coordenada } from '../tipos/tablero';
import type { Recurso } from '../../../common/jugador';
import { FASE_JUEGO, FASE_PARTIDA } from '../../../common/fases';
import { leerEstado } from '../utils/estado';

interface Opciones {
  sala: Room | null | undefined;
  estado: EstadoCatan | null;
  esMiTurno: boolean;
}

export function useLadron({ sala, estado, esMiTurno }: Opciones) {
  const [descarteEnEspera, setDescarteEnEspera] = useState<number | null>(null);
  const [moviendoLadron, setMoviendoLadron] = useState(false);
  const [robando, setRobando] = useState(false);

  useEffect(() => {
    if (!sala) return;
    const salaActual = sala;

    function actualizarEstado() {
      const estadoSala = leerEstado(salaActual);

      // Cada descarte aceptado reduce la cuenta del servidor.
      setDescarteEnEspera((cantidadAnterior) => {
        if (cantidadAnterior === null) return null;
        const partida = estadoSala?.partida;
        const restantes = partida?.jugadoresParaDescartar[salaActual.sessionId] ?? 0;
        return !partida || partida.faseJuego !== FASE_JUEGO.DESCARTE || restantes < cantidadAnterior
          ? null
          : cantidadAnterior;
      });

      // Al mover al ladrón el backend cambia la fase (Acciones o Robo).
      if (!estadoSala || estadoSala.partida.faseJuego !== FASE_JUEGO.LADRON) {
        setMoviendoLadron(false);
      }
      if (!estadoSala || estadoSala.partida.faseJuego !== FASE_JUEGO.ROBO) {
        setRobando(false);
      }
    }

    actualizarEstado();
    salaActual.onStateChange(actualizarEstado);

    const dejarDeEscucharErrores = salaActual.onMessage('error', () => {
      setDescarteEnEspera(null);
      setMoviendoLadron(false);
      setRobando(false);
    });

    return () => {
      salaActual.onStateChange.remove(actualizarEstado);
      dejarDeEscucharErrores();
    };
  }, [sala]);

  const miSessionId = sala?.sessionId ?? '';
  const partida = estado?.partida;
  const enJuego = Boolean(sala && partida?.fase === FASE_PARTIDA.JUEGO);

  const descartesPendientes = partida?.jugadoresParaDescartar[miSessionId] ?? 0;

  const esSuTurnoDeDescartar = enJuego
    && partida?.faseJuego === FASE_JUEGO.DESCARTE
    && descartesPendientes > 0;

  const puedeMoverLadron = enJuego && esMiTurno && partida?.faseJuego === FASE_JUEGO.LADRON;
  
  const puedeRobar = enJuego && esMiTurno && partida?.faseJuego === FASE_JUEGO.ROBO;

  function descartarRecurso(recurso: Recurso) {
    const disponibles = estado?.jugadores[miSessionId]?.recursos[recurso] ?? 0;
    if (!sala || !esSuTurnoDeDescartar || descarteEnEspera !== null || disponibles < 1) return;
    setDescarteEnEspera(descartesPendientes);
    sala.send('msgDescartarRecursos', { recurso });
  }

  function moverLadron(hexagono: Coordenada) {
    if (!sala || !puedeMoverLadron || moviendoLadron) return;
    setMoviendoLadron(true);
    sala.send('msgMoverLadron', { h: hexagono.h, d: hexagono.d });
  }

  function robarJugador(jugadorRobado: string) {
    if (!sala || !puedeRobar || robando) return;
    setRobando(true);
    sala.send('msgRobarJugador', { jugadorRobado });
  }

  return {
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
  };
}
