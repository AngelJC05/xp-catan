import { useState, type ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import CaraDado from './componentes/CaraDado';
import './TirarDados.css';

export interface ResultadoDados {
  dado1: number;
  dado2: number;
  suma: number;
}

interface Props {
  resultado: ResultadoDados | null;
  puedeLanzar: boolean;
  lanzando: boolean;
  onLanzar: () => void;
  puedePasarTurno: boolean;
  pasandoTurno: boolean;
  onPasarTurno: () => void;
  // Quién tiene el turno, arriba de los dados
  insignia?: ReactNode;
}

// Se muestra flotando sobre el tablero: los dados son el botón de lanzar.
function TirarDados({
  resultado, puedeLanzar, lanzando, onLanzar,
  puedePasarTurno, pasandoTurno, onPasarTurno, insignia,
}: Props) {
  const [resultadoVisto, setResultadoVisto] = useState(resultado);
  const [tirada, setTirada] = useState(0);

  if (resultadoVisto !== resultado) {
    setResultadoVisto(resultado);
    setTirada((anterior) => anterior + 1);
  }

  const estado = lanzando
    ? 'Lanzando dados…'
    : puedeLanzar
      ? 'Es tu turno: lanza los dados.'
      : 'Espera tu turno y la fase de dados.';

  const clase = tirada > 0 ? 'caraDado--cae' : undefined;
  const lanzarActivo = puedeLanzar && !lanzando;
  const pasarActivo = puedePasarTurno && !pasandoTurno;

  return (
    <section
      aria-label="Dados"
      className={`d-flex flex-column align-items-center gap-1 p-2 rounded-3 border border-3 bg-white bg-opacity-75 shadow-sm ${lanzarActivo ? 'border-primary' : 'border-white'}`}
    >
      <span className="visually-hidden" role="status">{estado}</span>
      {insignia}

      <button
        type="button"
        className="d-flex align-items-center gap-3 border-0 bg-transparent p-1"
        style={{ cursor: lanzarActivo ? 'pointer' : 'default' }}
        onClick={() => { if (lanzarActivo) onLanzar(); }}
        aria-disabled={!lanzarActivo}
        aria-label="Lanzar dados"
        title={estado}
      >
        <span className="d-flex gap-2">
          <CaraDado
            key={`a-${tirada}`}
            valor={resultado?.dado1 ?? null}
            etiqueta={resultado ? `Primer dado: ${resultado.dado1}` : 'Primer dado vacío'}
            className={clase}
          />
          <CaraDado
            key={`b-${tirada}`}
            valor={resultado?.dado2 ?? null}
            etiqueta={resultado ? `Segundo dado: ${resultado.dado2}` : 'Segundo dado vacío'}
            className={clase}
          />
        </span>
        <strong className="fs-3 text-body" title="Total de los dados">{resultado?.suma ?? '—'}</strong>
      </button>

      {lanzarActivo && <span className="small fw-bold text-primary">Toca los dados</span>}

      <Button
        size="sm"
        variant={pasarActivo ? 'success' : 'outline-secondary'}
        className="px-3 fw-bold"
        onClick={onPasarTurno}
        disabled={!pasarActivo}
        title="Terminar tu turno"
      >
        {pasandoTurno ? 'Pasando…' : 'Pasar turno'}
      </Button>
    </section>
  );
}

export default TirarDados;
