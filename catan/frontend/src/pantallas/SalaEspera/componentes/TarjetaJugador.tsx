import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import { hexDeColor } from "../../../common/colores";
import { ICONO_UI } from "../../../common/iconos";
import Icono from "../../../componentes/Icono";
import type { JugadorVista } from "../tipos";
import SelectorColor from "./SelectorColor";

interface TarjetaJugadorProps {
  jugador: JugadorVista;
  ocupados: number[];
  puedeQuitar: boolean;
  onElegirColor: (color: number) => void;
  onQuitar: () => void;
}

function iniciales(texto: string): string {
  return texto.slice(0, 2).toUpperCase();
}

//* Asiento ocupado de la sala de espera: avatar, nombre y selector de color

export default function TarjetaJugador({
  jugador, ocupados, puedeQuitar, onElegirColor, onQuitar,
}: TarjetaJugadorProps) {
  return (
    <li className="col-6 col-sm-3">
      <Card variant="outlined" className="h-100">
        <CardContent className="d-flex flex-column align-items-center gap-2 p-3">
          <Avatar sx={{ bgcolor: jugador.esBot ? "grey.200" : hexDeColor(jugador.color), width: 52, height: 52 }}>
            {jugador.esBot ? <Icono ruta={ICONO_UI.bot} tam={32} /> : iniciales(jugador.nombre || jugador.sessionId)}
          </Avatar>
          <span className="fw-bold small text-truncate mw-100" title={jugador.nombre}>
            {jugador.nombre}
          </span>
          {jugador.esUsuarioActual && <Chip label="Tú" color="info" size="small" />}
          {jugador.esBot && <Chip label="Bot" variant="outlined" size="small" />}
          <SelectorColor
            color={jugador.color}
            ocupados={ocupados}
            editable={jugador.esUsuarioActual}
            onElegir={onElegirColor}
          />
          {puedeQuitar && (
            <Button size="small" color="error" onClick={onQuitar}>
              Quitar
            </Button>
          )}
        </CardContent>
      </Card>
    </li>
  );
}
