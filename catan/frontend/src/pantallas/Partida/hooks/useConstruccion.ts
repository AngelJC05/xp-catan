import { useEffect, useRef, useState } from 'react';
import type { Room } from '@colyseus/sdk';
import type { ObjetivoConstruccion, TipoConstruccion } from '../componentes/Construir/Construir';
import { FASE_JUEGO, FASE_PARTIDA } from '../../../common/fases';
import { leerEstado } from '../utils/estado';

const MENSAJE_CONSTRUIR: Record<TipoConstruccion, string> = {
  poblado: 'msgColocarAsentamiento',
  camino: 'msgColocarCamino',
  ciudad: 'msgColocarCiudad',
};

export function useConstruccion(
  sala: Room | null | undefined,
  colocandoCaminosGratis: boolean,
  carreterasGratis: number,
) {
  const [tipoConstruccion, setTipoConstruccion] = useState<TipoConstruccion | null>(null);
  const [objetivoConstruccion, setObjetivoConstruccion] = useState<ObjetivoConstruccion | null>(null);
  const [caminoGratisEnEspera, setCaminoGratisEnEspera] = useState<number | null>(null);
  const modoCaminosGratis = useRef(false);

  useEffect(() => {
    if (!sala) return;
    const salaActual = sala;

    function actualizarEstado() {
      const estado = leerEstado(salaActual);

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
    const dejarDeEscucharErrores = salaActual.onMessage('error', () => setCaminoGratisEnEspera(null));

    return () => {
      salaActual.onStateChange.remove(actualizarEstado);
      dejarDeEscucharErrores();
    };
  }, [sala]);

  function limpiarConstruccion() {
    setTipoConstruccion(null);
    setObjetivoConstruccion(null);
  }

  function seleccionarConstruccion(tipo: TipoConstruccion | null) {
    setTipoConstruccion(tipo);
    setObjetivoConstruccion(null);
  }

  function seleccionarObjetivo(objetivo: ObjetivoConstruccion) {
    if (!sala || !tipoConstruccion) return;

    if (colocandoCaminosGratis && tipoConstruccion === 'camino') {
      if (caminoGratisEnEspera !== null) return;
      setObjetivoConstruccion(objetivo);
      setCaminoGratisEnEspera(carreterasGratis);
      sala.send('msgCaminoGratis', objetivo);
      return;
    }

    setObjetivoConstruccion(objetivo);
    sala.send(MENSAJE_CONSTRUIR[tipoConstruccion], objetivo);
    setTipoConstruccion(null);
  }

  return {
    tipoConstruccion,
    objetivoConstruccion,
    caminoGratisEnEspera,
    limpiarConstruccion,
    seleccionarConstruccion,
    seleccionarObjetivo,
  };
}
