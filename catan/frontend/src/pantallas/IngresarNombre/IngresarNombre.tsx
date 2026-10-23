import { useState, type FormEvent } from "react";
import "./IngresarNombre.css";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ICONO_PIEZA } from "../../common/iconos";
import { PIEZA } from "../../common/jugador";
import { LARGO_MAXIMO_NOMBRE, validarNombreJugador } from "../nombreJugador";

interface IngresarNombreProps {
  nombreInicial?: string;
  onConfirmar: (nombre: string) => void;
  onVolver?: () => void;
}

function IngresarNombre({ nombreInicial = "", onConfirmar, onVolver }: IngresarNombreProps) {
  const [nombre, setNombre] = useState(nombreInicial);
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  const error = validarNombreJugador(nombre);
  const mostrarError = intentoEnviar && error;

  function confirmar(e: FormEvent) {
    e.preventDefault();
    setIntentoEnviar(true);
    if (!error) onConfirmar(nombre.trim());
  }

  return (
    <div className="bg-info-subtle min-vh-100 d-flex align-items-center justify-content-center px-3 py-4">
      <div className="w-100 d-flex flex-column align-items-start gap-3 ingresar-nombre__contenido">
        {onVolver && (
          <Button variant="text" onClick={onVolver}>
            ← Volver
          </Button>
        )}

        <Card variant="outlined" className="w-100">
          <CardContent component="form" onSubmit={confirmar} className="p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <Chip label="Catan Online" color="primary" variant="outlined" size="small" />
              <img src={ICONO_PIEZA[PIEZA.ASENTAMIENTO]} alt="" aria-hidden="true" width={32} height={32} />
            </div>

            <Typography variant="h5" component="h1" gutterBottom>
              ¿Cómo te llamas, colono?
            </Typography>
            <p className="text-body-secondary mb-4">
              Este nombre lo verán los demás jugadores en el lobby y durante la partida.
            </p>

            <TextField
              id="nombre-jugador"
              label="Tu nombre de jugador"
              placeholder="Ej. Colono Valiente"
              fullWidth
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              error={Boolean(mostrarError)}
              helperText={
                <span className="d-flex justify-content-between">
                  <span>{mostrarError ? error : ""}</span>
                  <span>
                    {nombre.trim().length}/{LARGO_MAXIMO_NOMBRE}
                  </span>
                </span>
              }
              slotProps={{ htmlInput: { maxLength: LARGO_MAXIMO_NOMBRE } }}
            />

            <Button type="submit" variant="contained" fullWidth size="large" className="mt-3" disabled={!nombre.trim()}>
              Continuar →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default IngresarNombre;
