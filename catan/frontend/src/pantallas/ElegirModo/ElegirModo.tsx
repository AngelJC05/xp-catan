import "./ElegirModo.css";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { ICONO_PIEZA, ICONO_UI } from "../../common/iconos";
import Icono from "../../componentes/Icono";
import { PIEZA } from "../../common/jugador";

const OPCIONES = [
  {
    id: "crear",
    titulo: "Crear partida",
    detalle: "Abre una sala nueva, pública o privada, y espera a que se unan los demás jugadores.",
    icono: ICONO_PIEZA[PIEZA.CIUDAD],
    colorBorde: "error.main",
  },
  {
    id: "unirse",
    titulo: "Unirse a partida",
    detalle: "Mira las salas disponibles o entra con el identificador que te compartieron.",
    icono: ICONO_PIEZA[PIEZA.CAMINO],
    colorBorde: "info.main",
  },
] as const;

interface ElegirModoProps {
  nombreJugador?: string;
  onCrear: () => void;
  onUnirse: () => void;
  onVolver: () => void;
  onCambiarNombre?: () => void;
}

function ElegirModo({ nombreJugador, onCrear, onUnirse, onVolver, onCambiarNombre }: ElegirModoProps) {
  return (
    <div className="bg-info-subtle min-vh-100 px-3 py-4">
      <div className="mx-auto elegir__contenido">
        <Button variant="text" onClick={onVolver} startIcon={<Icono ruta={ICONO_UI.atras} />}>
          Volver
        </Button>

        <header className="mt-4 mb-4">
          {nombreJugador && (
            <p className="d-flex flex-wrap align-items-baseline gap-2 mb-1 fs-5">
              <span>
                ¡Hola, <strong>{nombreJugador}</strong>!
              </span>
              {onCambiarNombre && (
                <Link component="button" variant="body2" onClick={onCambiarNombre}>
                  cambiar nombre
                </Link>
              )}
            </p>
          )}
          <Typography variant="h4" component="h1" gutterBottom>
            ¿Qué quieres hacer?
          </Typography>
          <p className="mb-0 text-body-secondary">
            Puedes empezar una partida nueva o entrar a una que ya esté abierta.
          </p>
        </header>

        <div className="row g-3">
          {OPCIONES.map((opcion) => (
            <div className="col-12 col-sm-6" key={opcion.id}>
              <Card variant="outlined" className="h-100" sx={{ borderTop: 6, borderTopColor: opcion.colorBorde }}>
                <CardActionArea className="h-100" onClick={opcion.id === "crear" ? onCrear : onUnirse}>
                  <CardContent className="d-flex flex-column gap-2">
                    <img src={opcion.icono} alt="" aria-hidden="true" width={40} height={40} />
                    <Typography variant="h6" component="span">
                      {opcion.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {opcion.detalle}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ElegirModo;
