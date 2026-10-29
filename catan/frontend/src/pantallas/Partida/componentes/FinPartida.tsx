import { useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { ICONO_UI } from "../../../common/iconos";
import { COLOR, colorTextoSobre } from "../../../common/colores";
import { colorDelJugador, type Jugadores } from "../../../common/jugador";
import { detenerSonido, reproducirSonido } from "../../../common/sonidos";
import Icono from "../../../componentes/Icono";

interface Props {
    abierto: boolean;
    nombreGanador: string;
    soyElGanador: boolean;
    // sessionId del ganador y los jugadores, para la tabla final
    ganador: string;
    jugadores: Jugadores;
    onSalir: () => void;
    onVerTablero: () => void;
}

//* Modal obligatorio cuando el backend termina la partida (fase FINALIZADA)

function FinPartida({ abierto, nombreGanador, soyElGanador, ganador, jugadores, onSalir, onVerTablero }: Props) {
    // Suena una vez al abrirse, sin importar como se gano la partida,
    // y se detiene al cerrar la ventana o salir de la sala
    useEffect(() => {
        if (!abierto) return;
        reproducirSonido('victoria');
        return () => detenerSonido('victoria');
    }, [abierto]);

    // De mayor a menor puntuacion; en empate el ganador va primero
    const tabla = Object.entries(jugadores).sort(([idA, a], [idB, b]) =>
        b.puntuacion - a.puntuacion || Number(idB === ganador) - Number(idA === ganador));

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

                {/* Tabla final: cada jugador con su color y su puntuacion */}
                <ol className="list-unstyled d-flex flex-column gap-1 mt-3 mb-0 text-start" aria-label="Puntuación final">
                    {tabla.map(([id, jugador], posicion) => (
                        <li
                            key={id}
                            className={`d-flex align-items-center gap-2 rounded px-2 py-1 ${id === ganador ? 'fw-bold' : ''}`}
                            style={{
                                backgroundColor: colorDelJugador(jugadores, id),
                                color: colorTextoSobre(jugador.color ?? COLOR.SIN_COLOR),
                            }}
                        >
                            <span className="flex-shrink-0">{posicion + 1}.</span>
                            {id === ganador && <Icono ruta={ICONO_UI.trofeo} tam={18} />}
                            <span className="flex-grow-1 text-truncate">{jugador.nombre}</span>
                            <span className="flex-shrink-0">{jugador.puntuacion} pts</span>
                        </li>
                    ))}
                </ol>

                <Typography color="text.secondary" sx={{ mt: 2 }}>
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
