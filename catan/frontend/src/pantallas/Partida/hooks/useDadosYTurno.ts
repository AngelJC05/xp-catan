import { useEffect, useState } from 'react';
import type { Room } from '@colyseus/sdk';
import type { ResultadoDados } from '../componentes/TirarDados/TirarDados';
import { FASE_JUEGO, FASE_PARTIDA } from '../../../common/fases';
import { leerEstado } from '../utils/estado';
import { reproducirSonido } from '../utils/sonidos';

export function useDadosYTurno(
  sala: Room | null | undefined,
  puedeLanzarDados: boolean,
  puedePasarTurno: boolean,
) {
  const [resultadoDados, setResultadoDados] = useState<ResultadoDados | null>(null);
  const [lanzandoDados, setLanzandoDados] = useState(false);
  const [pasandoTurno, setPasandoTurno] = useState(false);

  useEffect(() => {
    if (!sala) return;
    const salaActual = sala;

    function actualizarEstado() {
      const estado = leerEstado(salaActual);
      if (!estado
        || estado.partida.turnoActual !== salaActual.sessionId
        || estado.partida.fase !== FASE_PARTIDA.JUEGO
        || estado.partida.faseJuego !== FASE_JUEGO.ACCIONES) {
        setPasandoTurno(false);
      }
    }

    actualizarEstado();
    salaActual.onStateChange(actualizarEstado);

    const dejarDeEscucharDados = salaActual.onMessage('dados', (resultado: ResultadoDados) => {
      setResultadoDados(resultado);
      setLanzandoDados(false);
      reproducirSonido('dados');
    });

    const dejarDeEscucharErrores = salaActual.onMessage('error', () => {
      setLanzandoDados(false);
      setPasandoTurno(false);
    });

    return () => {
      salaActual.onStateChange.remove(actualizarEstado);
      dejarDeEscucharDados();
      dejarDeEscucharErrores();
    };
  }, [sala]);

  function lanzarDados() {
    if (!sala || !puedeLanzarDados || lanzandoDados) return;
    setLanzandoDados(true);
    sala.send('msgLanzarDados');
  }

  function pasarTurno() {
    if (!sala || !puedePasarTurno || pasandoTurno) return;
    setPasandoTurno(true);
    sala.send('msgPasarTurno');
  }

  return { resultadoDados, lanzandoDados, pasandoTurno, lanzarDados, pasarTurno };
}
