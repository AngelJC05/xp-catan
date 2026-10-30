import { Card } from 'react-bootstrap';
import { ICONO_CARTA_DESARROLLO, ICONO_PIEZA, ICONO_RECURSO } from '../../../common/iconos';
import { NOMBRE_PIEZA, PIEZA, type Recurso } from '../../../common/jugador';

type Fila = { icono: string; nombre: string; costes: Recurso[] };

const FILAS: Fila[] = [
  { icono: ICONO_PIEZA[PIEZA.CAMINO], nombre: NOMBRE_PIEZA[PIEZA.CAMINO],
    costes: ['madera', 'ladrillo'] },
  { icono: ICONO_PIEZA[PIEZA.ASENTAMIENTO], nombre: NOMBRE_PIEZA[PIEZA.ASENTAMIENTO],
    costes: ['madera', 'trigo', 'lana', 'ladrillo'] },
  { icono: ICONO_PIEZA[PIEZA.CIUDAD], nombre: NOMBRE_PIEZA[PIEZA.CIUDAD],
    costes: ['trigo', 'trigo', 'mineral', 'mineral', 'mineral'] },
  { icono: ICONO_CARTA_DESARROLLO, nombre: 'Carta de desarrollo',
    costes: ['trigo', 'lana', 'mineral'] },
];

function TablaCostes() {
  return (
    <Card className="h-100 w-100 overflow-y-auto overflow-x-hidden d-flex flex-column">
      <h3 className="text-center fs-6 fw-bold border-bottom mb-0 py-1">Costes</h3>

      <div className="d-flex flex-column justify-content-around flex-fill p-1">
        {FILAS.map(({ icono, nombre, costes }) => (
          <div key={nombre} className="d-flex align-items-center gap-1" title={nombre}>
            <img src={icono} alt={nombre} width={22} height={22} />
            <span className="text-body-secondary">:</span>
            <span className="d-flex align-items-center">
              {costes.map((recurso, i) => (
                <img key={i} src={ICONO_RECURSO[recurso]} alt={recurso} width={19} height={19} />
              ))}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default TablaCostes;
