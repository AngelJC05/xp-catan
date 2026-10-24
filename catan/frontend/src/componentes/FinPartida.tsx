import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { ICONO_UI } from "../common/iconos";
import Icono from "./Icono";

interface Props {
    abierto: boolean;
    nombreGanador: string;
    soyElGanador: boolean;
    onSalir: () => void;
    onVerTablero: () => void;
}

//* Modal obligatorio cuando el backend termina la partida (fase FINALIZADA)

function FinPartida({ abierto, nombreGanador, soyElGanador, onSalir, onVerTablero }: Props) {
    return (
        <Dialog
            open={abierto}
            // Obligatorio: Escape y el clic afuera llaman a onClose, que no hace
            // nada; solo se cierra con sus botones.
            onClose={() => {}}
            fullWidth
            maxWidth="xs"
            aria-labelledby="fin-partida-titulo"
        >
            <DialogTitle id="fin-partida-titulo" className="text-center">
                <Icono ruta={ICONO_UI.trofeo} tam={24} className="me-2" />Partida finalizada
            </DialogTitle>
            <DialogContent className="text-center">
                <Typography variant="h5" component="p" className="fw-bold">
                    {soyElGanador ? '¡Ganaste la partida!' : `¡${nombreGanador} ganó la partida!`}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Puedes salir de la sala o quedarte a ver cómo terminó el tablero.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button variant="outlined" onClick={onVerTablero}>
                    Ver tablero
                </Button>
                <Button variant="contained" color="error" onClick={onSalir}>
                    Salir de la sala
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default FinPartida;
