import { useCallback, useEffect, useRef } from 'react';
import type { Room } from '@colyseus/sdk';

const CADA_CUANTO_SINCRONIZAR_MS = 30000;

// Calcula cuanto se diferencia el reloj del dispositivo del reloj del servidor y devuelve una funcion
// que da la hora del servidor "ahora". Le pregunta la hora al servidor con msgHora.
export function useHoraServidor(sala: Room | null | undefined) {
  const diferencia = useRef(0);

  useEffect(() => {
    if (!sala) return;
    const salaActual = sala;

    function sincronizar() {
      const enviado = Date.now();
      salaActual.send('msgHora', undefined, (horaServidor) => {
        const recibido = Date.now();
        const viaje = (recibido - enviado) / 2;
        diferencia.current = horaServidor + viaje - recibido;
      });
    }

    sincronizar();
    const intervalo = setInterval(sincronizar, CADA_CUANTO_SINCRONIZAR_MS);

    return () => clearInterval(intervalo);
  }, [sala]);

  return useCallback(() => Date.now() + diferencia.current, []);
}
