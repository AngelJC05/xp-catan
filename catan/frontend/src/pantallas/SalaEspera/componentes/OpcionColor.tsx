import Avatar from "@mui/material/Avatar";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { NOMBRE_COLOR, colorTextoSobre, hexDeColor } from "../../../common/colores";

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
      <Avatar sx={{ bgcolor: hexDeColor(color), color: colorTextoSobre(color), width: 44, height: 44 }}>
        {seleccionado && (
          <svg viewBox="0 0 16 16" width={22} height={22} aria-hidden="true">
            <path
              d="M3 8.5 6.5 12 13 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </Avatar>
      <Typography variant="caption">{nombre}</Typography>
    </ButtonBase>
  );
}
