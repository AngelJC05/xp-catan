import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import type { SalaDisponible } from "../utils/salas";

interface TarjetaSalaProps {
  sala: SalaDisponible;
  seleccionada: boolean;
  // id de la sala a la que se está entrando, o null si no se está entrando a ninguna.
  uniendo: string | null;
  onSeleccionar: () => void;
  onUnirse: () => void;
}

//* Una sala del listado: nombre, tipo, anfitrión, ocupación y botón para unirse

export default function TarjetaSala({ sala, seleccionada, uniendo, onSeleccionar, onUnirse }: TarjetaSalaProps) {
  return (
    // Franja de color a la izquierda: verde si es pública, roja si es privada.
    // La sala seleccionada se marca con un contorno celeste.
    <Card
      variant="outlined"
      className="h-100"
      onClick={onSeleccionar}
      sx={{
        cursor: "pointer",
        borderLeft: 6,
        borderLeftColor: sala.tipo === "publica" ? "success.main" : "error.main",
        outline: seleccionada ? 3 : 0,
        outlineStyle: "solid",
        outlineColor: "info.main",
      }}
    >
      <CardContent className="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
        <div className="d-flex flex-column gap-1 flex-grow-1 text-truncate">
          <div className="d-flex align-items-center gap-2">
            <Typography variant="h6" component="span" noWrap>
              {sala.nombre}
            </Typography>
            <Chip
              label={sala.tipo === "publica" ? "🌍 Pública" : "🔒 Privada"}
              color={sala.tipo === "publica" ? "success" : "error"}
              variant="outlined"
              size="small"
            />
          </div>
          <small className="text-body-secondary">
            {sala.anfitrion ? `Anfitrión: ${sala.anfitrion}` : "Sin anfitrión"}
          </small>
          <div
            className="d-flex align-items-center gap-2"
            aria-label={`${sala.jugadores} de ${sala.maxJugadores} jugadores`}
          >
            <LinearProgress
              variant="determinate"
              color="info"
              value={(sala.jugadores / sala.maxJugadores) * 100}
              className="flex-grow-1 rounded"
              aria-hidden="true"
            />
            <small className="fw-bold text-body-secondary" aria-hidden="true">
              {sala.jugadores}/{sala.maxJugadores}
            </small>
          </div>
        </div>

        <Button
          variant="contained"
          color={sala.tipo === "privada" ? "error" : "primary"}
          disabled={uniendo !== null}
          onClick={(e) => {
            e.stopPropagation();
            onUnirse();
          }}
        >
          {uniendo === sala.id ? "Entrando…" : sala.tipo === "privada" ? "🔑 Unirse" : "Unirse"}
        </Button>
      </CardContent>
    </Card>
  );
}
