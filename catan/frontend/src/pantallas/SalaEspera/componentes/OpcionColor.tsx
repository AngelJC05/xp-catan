import Avatar from "@mui/material/Avatar";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { NOMBRE_COLOR, hexDeColor } from "../../../common/colores";

interface OpcionColorProps {
  color: number;
  ocupado: boolean;
  seleccionado: boolean;
  onElegir: (color: number) => void;
}

//* Un color dentro de la ventana de seleccion se vera como un circulo con su nombre debajo

export default function OpcionColor({
  color, ocupado, seleccionado, onElegir,
}: OpcionColorProps) {
  const nombre = NOMBRE_COLOR[color];

  return (
    <ButtonBase
      onClick={() => onElegir(color)}
      disabled={ocupado || seleccionado}
      aria-label={`Elegir ${nombre}`}
      aria-pressed={seleccionado}
      className="d-flex flex-column align-items-center gap-1 p-2 rounded"
      sx={{ opacity: ocupado ? 0.35 : 1 }}
    >
      <Avatar sx={{ bgcolor: hexDeColor(color), width: 44, height: 44 }}>
        {seleccionado ? "✔" : ""}
      </Avatar>
      <Typography variant="caption">{nombre}</Typography>
    </ButtonBase>
  );
}
