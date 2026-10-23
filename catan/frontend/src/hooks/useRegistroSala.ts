import { useEffect, useState } from 'react';
import type { Room } from '@colyseus/sdk';
import type { LineaRegistro, MensajeRegistro } from '../componentes/chat';

// Guarda el historial de "chat" y "log" que difunde el servidor
export function useRegistroSala(sala: Room | null): LineaRegistro[] {
  const [registro, setRegistro] = useState<LineaRegistro[]>([]);

  useEffect(() => {
    if (!sala) {
      setRegistro([]);
      return;
    }

    const agregarLinea = (linea: LineaRegistro) =>
      setRegistro((anterior) => [...anterior, linea].slice(-100));

    // onMessage devuelve la funcion que quita ese oyente
    const quitarOyenteChat = sala.onMessage(
      'chat',
      ({ jugador, mensaje }: MensajeRegistro) =>
        agregarLinea({ tipo: 'chat', jugador, mensaje }),
    );

    const quitarOyenteLog = sala.onMessage(
      'log',
      ({ jugador, mensaje }: MensajeRegistro) =>
        agregarLinea({ tipo: 'log', jugador, mensaje }),
    );

    return () => {
      quitarOyenteChat();
      quitarOyenteLog();
    };
  }, [sala]);

  return registro;
}
