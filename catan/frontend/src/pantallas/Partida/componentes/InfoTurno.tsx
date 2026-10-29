import type { Jugadores } from '../../../common/jugador';
import { colorDelJugador } from '../../../common/jugador';
import { COLOR, colorTextoSobre } from '../../../common/colores';

interface Props {
  sessionIdTurno: string;
  jugadores: Jugadores;
}

function InfoTurno({ sessionIdTurno, jugadores }: Props) {
  const nombre = jugadores[sessionIdTurno]?.nombre;
  const color = colorDelJugador(jugadores, sessionIdTurno);
  const colorTexto = colorTextoSobre(jugadores[sessionIdTurno]?.color ?? COLOR.SIN_COLOR);

  return (
    <span
      className="badge rounded-pill text-truncate mw-100 px-3 py-2"
      style={{ backgroundColor: color, color: colorTexto }}
      title={`Turno de ${nombre ?? '—'}`}
      role="status"
      aria-live="polite"
    >
      {nombre ?? '—'}
    </span>
  );
}

export default InfoTurno;