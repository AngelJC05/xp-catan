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
    <div
      className="flex-fill w-100 rounded overflow-hidden
                 d-flex flex-column justify-content-center align-items-center"
      style={{ backgroundColor: color, color: colorTexto }}
      role="status"
      aria-live="polite"
    >
      <span className="small">Turno de</span>
      <span className="fw-bold text-truncate mw-100 px-2">{nombre ?? '—'}</span>
    </div>
  );
}

export default InfoTurno;