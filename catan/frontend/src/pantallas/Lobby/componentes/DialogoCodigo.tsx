import type { FormEvent } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import type { Theme } from "@mui/material/styles";
import { ICONO_UI } from "../../../common/iconos";
import Icono from "../../../componentes/Icono";
import { LARGO_MAXIMO_CODIGO } from "../../validacionSala";
import type { SalaPorCodigo } from "../utils/salas";

interface DialogoCodigoProps {
  // Sala a la que se le pide el código, o null si la ventana está cerrada.
  sala: SalaPorCodigo | null;
  codigo: string;
  error: string | null;
  // id de la sala a la que se está entrando, o null si no se está entrando a ninguna.
  uniendo: string | null;
  // Recibe el código ya sin espacios.
  onCambiarCodigo: (codigo: string) => void;
  onCerrar: () => void;
  onEnviar: (e: FormEvent) => void;
}

//* Ventana que pide el código de acceso para entrar a una sala privada

export default function DialogoCodigo({
  sala, codigo, error, uniendo, onCambiarCodigo, onCerrar, onEnviar,
}: DialogoCodigoProps) {
  return (
    // Dialog ya cierra con Escape y al hacer clic fuera (llama a onClose).
    <Dialog
      open={sala !== null}
      onClose={onCerrar}
      aria-labelledby="dialogo-codigo-titulo"
      fullWidth
      maxWidth="xs"
    >
      <form onSubmit={onEnviar} noValidate>
        <DialogTitle id="dialogo-codigo-titulo" className="text-center">
          <Icono ruta={ICONO_UI.privada} tam={22} className="me-2" />Sala privada
        </DialogTitle>
        <DialogContent>
          <p className="text-center text-body-secondary">
            {sala?.nombre ? (
              <>
                Para entrar a <strong>{sala.nombre}</strong> necesitas su código de acceso.
              </>
            ) : (
              "Para entrar a esta sala necesitas su código de acceso."
            )}
          </p>

          <TextField
            id="codigo-acceso"
            label="Código de acceso"
            placeholder="Ej. OVEJA7"
            fullWidth
            autoFocus
            autoComplete="off"
            margin="dense"
            value={codigo}
            onChange={(e) => onCambiarCodigo(e.target.value.replace(/\s/g, ""))}
            error={Boolean(error)}
            helperText={error ?? "Pídeselo al anfitrión. Distingue mayúsculas."}
            slotProps={{ htmlInput: { maxLength: LARGO_MAXIMO_CODIGO, spellCheck: false } }}
            sx={{
              "& .MuiInputBase-input": { fontFamily: "monospace", fontSize: "1.2rem", letterSpacing: "0.25em" },
              "& .MuiInputBase-input::placeholder": {
                fontFamily: (theme: Theme) => theme.typography.fontFamily,
                fontSize: "1rem",
                letterSpacing: "normal",
              },
            }}
          />
        </DialogContent>
        <DialogActions className="px-4 pb-4">
          <Button variant="outlined" fullWidth onClick={onCerrar}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            fullWidth
            disabled={!codigo || uniendo !== null}
          >
            {uniendo ? "Entrando…" : "Entrar"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
