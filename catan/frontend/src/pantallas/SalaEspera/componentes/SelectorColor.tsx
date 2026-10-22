import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { COLOR, hexDeColor } from "../../../common/colores";
import OpcionColor from "./OpcionColor";

interface SelectorColorProps {
  color: number;
  ocupados: number[];
  editable: boolean;
  onElegir: (color: number) => void;
}

// Todas las opciones de la ventana, hasta sin color
const OPCIONES: number[] = Object.values(COLOR);

//* Circulo con el color del jugador si es el propio, al tocarlo abre la ventana para elegir

export default function SelectorColor({
  color, ocupados, editable, onElegir,
}: SelectorColorProps) {
  const [abierto, setAbierto] = useState(false);
  const sinColor = color === COLOR.SIN_COLOR;

  function elegir(nuevoColor: number) {
    onElegir(nuevoColor);
    setAbierto(false);
  }

  return (
    <>
      <ButtonBase
        onClick={() => setAbierto(true)}
        disabled={!editable}
        aria-label="Elegir color"
        className="d-flex flex-column align-items-center gap-1 rounded"
      >
        <Avatar sx={{ bgcolor: hexDeColor(color), width: 28, height: 28 }}>
          {sinColor ? "?" : ""}
        </Avatar>
        {editable && sinColor && (
          <Typography variant="caption" color="text.secondary">
            Elige color aquí
          </Typography>
        )}
      </ButtonBase>

      {/* Dialog ya cierra con Escape y al hacer click fuera */}
      <Dialog
        open={abierto} 
        onClose={() => setAbierto(false)}
        aria-labelledby="selector-color-titulo"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="selector-color-titulo" className="text-center">
          Elige tu color
        </DialogTitle>
        <DialogContent>
          <div className="row g-2">
            {OPCIONES.map((opcion) => (
              <div key={opcion} className="col-4 d-flex justify-content-center">
                <OpcionColor
                  color={opcion}
                  ocupado={opcion !== COLOR.SIN_COLOR && ocupados.includes(opcion)}
                  seleccionado={opcion === color}
                  onElegir={elegir}
                />
              </div>
            ))}
          </div>
          <Typography variant="caption" color="text.secondary" component="p" className="text-center mt-3 mb-0">
            Si no eliges color, se te asignará uno al azar al iniciar la partida.
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
}
