import { useState } from 'react';
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
}

function TirarDados({ resultado, puedeLanzar, lanzando, onLanzar }: Props) {
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

  return (
    <section
      className="d-flex flex-column align-items-center justify-content-center gap-2 h-100 p-2 text-center"
      aria-labelledby="tirar-dados-titulo"
    >
      <h2 id="tirar-dados-titulo" className="h6 mb-0">Dados</h2>
      <p className="small text-body-secondary mb-0" role="status">{estado}</p>

      <div className="d-flex justify-content-center gap-2">
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

      <p className="mb-0">Total: <strong>{resultado?.suma ?? '—'}</strong></p>

      <Button
        size="sm"
        variant="outline-primary"
        onClick={onLanzar}
        disabled={!puedeLanzar || lanzando}
      >
        {lanzando ? 'Lanzando…' : 'Lanzar dados'}
      </Button>
    </section>
  );
}

export default TirarDados;
