import { Badge, Button, Card } from 'react-bootstrap';
import type { Cartas, Jugador } from '../../../../common/jugador';
import { CARTA, NOMBRE_CARTA } from '../../../../common/jugador';
import { ICONO_CARTA, ICONO_CARTA_DESARROLLO } from '../../../../common/iconos';
import ContadorIcono from '../comunes/ContadorIcono';
import Icono from '../../../../componentes/Icono';

const CARTAS: (keyof Cartas)[] = [
  CARTA.CABALLERO,
  CARTA.PUNTOS_VICTORIA,
  CARTA.CARRETERAS,
  CARTA.ABUNDANCIA,
  CARTA.MONOPOLIO,
];

interface Props {
  miJugador?: Jugador;
  puedeComprar: boolean;
  comprando: boolean;
  onComprar: () => void;
  // Abre el menu para elegir que carta usar (componentes/UsarCarta.tsx).
  puedeUsarCarta: boolean;
  onUsarCarta: () => void;
}

function CarDesarrollo({ miJugador, puedeComprar, comprando, onComprar, puedeUsarCarta, onUsarCarta }: Props) {
  return (
    <Card className="h-100 w-100 overflow-hidden d-flex flex-column">
      <h3 className="text-center fs-6 fw-bold border-bottom mb-0 py-1">
        <Icono ruta={ICONO_CARTA_DESARROLLO} className="me-1" />Mis cartas
      </h3>
      {miJugador ? (
        <>
          <div className="d-flex flex-column justify-content-center flex-fill overflow-y-auto p-2" style={{ minHeight: 0 }}>

            {/* Cuadricula de 3 columnas, igual que la banca y mis recursos */}
            <div className="row row-cols-3 g-2 justify-content-center">
              {CARTAS.map((clave) => {
                const usables = miJugador.cartas_usables[clave];
                const nuevas = miJugador.cartas_inusables[clave];
                const esPuntoVictoria = clave === CARTA.PUNTOS_VICTORIA;
                return (
                  <div key={clave} className="col d-flex justify-content-center">
                    <ContadorIcono
                      icono={ICONO_CARTA[clave]}
                      cantidad={esPuntoVictoria ? usables + nuevas : usables}
                      descripcion={esPuntoVictoria
                        ? `${NOMBRE_CARTA[clave]}: su efecto es inmediato y no se puede jugar`
                        : NOMBRE_CARTA[clave]}
                      tam={28}
                      insignia={!esPuntoVictoria && nuevas > 0 && (
                        <Badge
                          bg="secondary"
                          title="Compradas este turno: se podrán usar hasta tu siguiente turno"
                        >
                          +{nuevas}
                        </Badge>
                      )}
                    />
                  </div>
                );
              })}
            </div>

          </div>
          
          <div className="d-flex flex-shrink-0 justify-content-center gap-2 pb-2">
            <Button
              variant={puedeComprar && !comprando ? 'primary' : 'outline-secondary'}
              size="sm"
              disabled={!puedeComprar || comprando}
              onClick={onComprar}
              title="Comprar carta. Costo: 1 trigo, 1 lana y 1 mineral"
              className="px-3 fw-bold"
            >
              {comprando ? 'Comprando…' : 'Comprar'}
            </Button>
            <Button
              variant={puedeUsarCarta ? 'success' : 'outline-secondary'}
              size="sm"
              disabled={!puedeUsarCarta}
              onClick={onUsarCarta}
              title="Usar carta. Solo una por turno, en la fase de acciones"
              className="px-3 fw-bold"
            >
              Usar
            </Button>
          </div>
        </>
      ) : (
        <p className="text-muted text-center my-auto">sin jugador</p>
      )}
    </Card>
  );
}

export default CarDesarrollo;
