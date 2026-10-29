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
  // Quién tiene el turno, arriba a la derecha del panel
  insignia?: ReactNode;
}

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
    <section className="h-100 d-flex flex-column" aria-labelledby="tirar-dados-titulo">
      <div className="d-flex align-items-center justify-content-between gap-2 border-bottom px-2 py-1">
        <h2 id="tirar-dados-titulo" className="fs-6 fw-bold mb-0">Dados</h2>
        {insignia}
      </div>

      <div className="flex-fill d-flex flex-column align-items-center justify-content-center gap-2 p-2 overflow-y-auto">
        <span className="visually-hidden" role="status">{estado}</span>

        <div className="d-flex align-items-center justify-content-center gap-3">
          <div className="d-flex gap-2">
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
          </div>
          <strong className="fs-3" title="Total de los dados">{resultado?.suma ?? '—'}</strong>
        </div>

        <div className="d-flex justify-content-center gap-2">
          <Button
            size="sm"
            variant={lanzarActivo ? 'primary' : 'outline-secondary'}
            className="px-3 fw-bold"
            onClick={onLanzar}
            disabled={!lanzarActivo}
            title={estado}
          >
            {lanzando ? 'Lanzando…' : 'Lanzar'}
          </Button>
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
        </div>
      </div>
    </section>
  );
}

export default TirarDados;
