import { useEffect, useState } from 'react';
import type { Room } from '@colyseus/sdk';
import type { EstadoCatan } from '../tipos/estado';
import type { Coordenada } from '../tipos/tablero';
import type { CartaUsable } from '../componentes/Cartas/UsarCarta';
import { CARTA, type Recurso } from '../../../common/jugador';
import { FASE_JUEGO, FASE_PARTIDA } from '../../../common/fases';
import { leerEstado } from '../utils/estado';

type EstadoCarta = null | 'eligiendo' | number;

function reconciliarCarta(
  anterior: EstadoCarta,
  estado: EstadoCatan | null,
  sessionId: string,
  carta: CartaUsable,
): EstadoCarta {
  if (anterior === null) return null;
  if (!estado || estado.partida.turnoActual !== sessionId) return null;

  const usables = estado.jugadores[sessionId]?.cartas_usables[carta] ?? 0;
  if (typeof anterior === 'number') return usables < anterior ? null : anterior;
  return estado.partida.faseJuego === FASE_JUEGO.ACCIONES ? anterior : null;
}

// Funcion que pone el estado eligiendo cuando se intenta usar y lo mantiene si hubo error
const reintentar = (anterior: EstadoCarta): EstadoCarta => (typeof anterior === 'number' ? 'eligiendo' : anterior);

interface Opciones {
  sala: Room | null | undefined;
  estado: EstadoCatan | null;
  esMiTurno: boolean;
  puedePasarTurno: boolean;
  limpiarConstruccion: () => void;
}

export function useCartas({ sala, estado, esMiTurno, puedePasarTurno, limpiarConstruccion }: Opciones) {
  const [compraEnEspera, setCompraEnEspera] = useState<number | null>(null);
  const [menuCartasAbierto, setMenuCartasAbierto] = useState(false);
  const [caballero, setCaballero] = useState<EstadoCarta>(null);
  const [abundancia, setAbundancia] = useState<EstadoCarta>(null);
  const [monopolio, setMonopolio] = useState<EstadoCarta>(null);
  const [carreterasEnEspera, setCarreterasEnEspera] = useState<number | null>(null);

  useEffect(() => {
    if (!sala) return;
    const salaActual = sala;
    const miId = salaActual.sessionId;

    function actualizarEstado() {
      const estadoSala = leerEstado(salaActual);

      setCompraEnEspera((cartasAnteriores) => {
        if (cartasAnteriores === null) return null;
        return !estadoSala
          || estadoSala.partida.turnoActual !== miId
          || estadoSala.partida.faseJuego !== FASE_JUEGO.ACCIONES
          || estadoSala.banca.cartas.length < cartasAnteriores
          ? null
          : cartasAnteriores;
      });

      setCaballero((anterior) => reconciliarCarta(anterior, estadoSala, miId, CARTA.CABALLERO));
      setAbundancia((anterior) => reconciliarCarta(anterior, estadoSala, miId, CARTA.ABUNDANCIA));
      setMonopolio((anterior) => reconciliarCarta(anterior, estadoSala, miId, CARTA.MONOPOLIO));

      setCarreterasEnEspera((anterior) => {
        if (anterior === null) return null;
        if (!estadoSala || estadoSala.partida.turnoActual !== miId) return null;
        const usables = estadoSala.jugadores[miId]?.cartas_usables[CARTA.CARRETERAS] ?? 0;
        return estadoSala.partida.faseJuego === FASE_JUEGO.CARRETERAS || usables < anterior ? null : anterior;
      });
    }

    actualizarEstado();
    salaActual.onStateChange(actualizarEstado);

    const dejarDeEscucharErrores = salaActual.onMessage('error', () => {
      setCompraEnEspera(null);
      setCaballero(reintentar);
      setAbundancia(reintentar);
      setMonopolio(reintentar);
      setCarreterasEnEspera(null);
    });

    return () => {
      salaActual.onStateChange.remove(actualizarEstado);
      dejarDeEscucharErrores();
    };
  }, [sala]);

  const miJugador = estado?.jugadores[sala?.sessionId ?? ''];

  const puedeComprarCarta = Boolean(
    sala
      && esMiTurno
      && estado?.partida.fase === FASE_PARTIDA.JUEGO
      && estado.partida.faseJuego === FASE_JUEGO.ACCIONES
      && estado.banca.cartas.length > 0
      && (miJugador?.recursos.trigo ?? 0) >= 1
      && (miJugador?.recursos.lana ?? 0) >= 1
      && (miJugador?.recursos.mineral ?? 0) >= 1,
  );

  const cartasUsables = miJugador?.cartas_usables;
  const tieneCartaUsable = Boolean(
    cartasUsables && 
    (
      cartasUsables[CARTA.CABALLERO] 
      + cartasUsables[CARTA.CARRETERAS]
      + cartasUsables[CARTA.ABUNDANCIA] 
      + cartasUsables[CARTA.MONOPOLIO] > 0
    )
  );

  const puedeUsarCarta = Boolean(
    puedePasarTurno
      && estado?.partida.cartaJugable
      && tieneCartaUsable
      && caballero === null
      && abundancia === null
      && monopolio === null
      && carreterasEnEspera === null,
  );

  function comprarCarta() {
    if (!sala || !puedeComprarCarta || compraEnEspera !== null) return;
    setCompraEnEspera(estado?.banca.cartas.length ?? 0);
    sala.send('msgComprarCarta');
  }

  function elegirCarta(carta: CartaUsable) {
    setMenuCartasAbierto(false);

    if (carta === CARTA.CABALLERO) {
      limpiarConstruccion();
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
    if (!sala || carreterasEnEspera !== null) return;
    limpiarConstruccion();
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

  return {
    compraEnEspera,
    caballero,
    abundancia,
    monopolio,
    cartasUsables,
    menuCartasAbierto,
    puedeComprarCarta,
    puedeUsarCarta,
    abrirMenuCartas: () => setMenuCartasAbierto(true),
    cerrarMenuCartas: () => setMenuCartasAbierto(false),
    cancelarCaballero: () => setCaballero(null),
    cancelarAbundancia: () => setAbundancia(null),
    cancelarMonopolio: () => setMonopolio(null),
    comprarCarta,
    elegirCarta,
    jugarCaballero,
    jugarAbundancia,
    jugarMonopolio,
  };
}
