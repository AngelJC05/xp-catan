import { Card } from 'react-bootstrap';
import type { Banca } from '../common/banca';
import type { Jugador } from '../common/jugador';
import { RECURSOS, PIEZA } from '../common/jugador';
import { ICONO_CARTA_DESARROLLO, ICONO_PIEZA, ICONO_RECURSO } from '../common/iconos';
import ContadorIcono from './ContadorIcono';

interface Props {
  banca: Banca;
  miJugador?: Jugador;
}

// Texto al pasar el mouse sobre cada pieza.
const DESCRIPCION_PIEZA: Record<string, string> = {
  [PIEZA.ASENTAMIENTO]: 'Asentamientos que te quedan',
  [PIEZA.CIUDAD]: 'Ciudades que te quedan',
  [PIEZA.CAMINO]: 'Caminos que te quedan',
};

// Funcion para devolver el texto con la iniciar Mayuscula
const conMayuscula = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

function Existencias({ banca, miJugador }: Props) {
  return (
    <Card className="h-100 w-100 overflow-y-auto overflow-x-hidden d-flex flex-column">
      <div className="d-flex flex-column flex-grow-1">

        <h3 className="text-center fs-6 fw-bold border-bottom mb-0 py-1">Banca</h3>

        <div className="d-flex flex-column justify-content-center flex-fill p-2">
          {/* Cuadricula de 3 columnas */}
          <div className="row row-cols-3 g-2">
            {RECURSOS.map((r) => (
              <div key={r} className="col d-flex justify-content-center">
                <ContadorIcono
                  icono={ICONO_RECURSO[r]}
                  cantidad={banca.recursos[r]}
                  descripcion={`${conMayuscula(r)} en la banca`}
                />
              </div>
            ))}

            <div className="col d-flex justify-content-center">
              <ContadorIcono
                icono={ICONO_CARTA_DESARROLLO}
                cantidad={banca.cartas.length}
                descripcion="Cartas de desarrollo que quedan en el mazo"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column">
        <h3 className="text-center fs-6 fw-bold border-bottom border-top mb-0 py-1">
          Mis piezas
        </h3>

        {miJugador ? (
          <div className="d-flex flex-wrap justify-content-around gap-2 p-2">
            {[PIEZA.ASENTAMIENTO, PIEZA.CIUDAD, PIEZA.CAMINO].map((pieza) => (
              <ContadorIcono
                key={pieza}
                icono={ICONO_PIEZA[pieza]}
                cantidad={miJugador.construccionesDisponibles[pieza]}
                descripcion={DESCRIPCION_PIEZA[pieza]}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted text-center my-auto">sin jugador</p>
        )}
      </div>
    </Card>
  );
}

export default Existencias;
