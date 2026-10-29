import { Button, Dialog, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import type { Jugadores } from "../../../common/jugador";
import { colorDelJugador, totalRecursos } from "../../../common/jugador";
import { COLOR, colorTextoSobre } from "../../../common/colores";
import { ICONO_RECURSOS } from "../../../common/iconos";
import ContadorIcono from "./comunes/ContadorIcono";

interface Props{
    abierto: boolean;
    jugadoresParaRobar: string[];
    jugadores: Jugadores;
    enviando: boolean;
    onRobar: (sessionId: string) => void;
}

//* Backend llena jugadoresParaRobar al mover al ladron cuando hay 2 o mas jugadores

function ElegirRobo({abierto, jugadoresParaRobar, jugadores, enviando, onRobar}: Props){
    return (
        <Dialog open={abierto} fullWidth maxWidth="xs" aria-labelledby="robar-titulo">
            {/*Titulo del modal*/}
            <DialogTitle id="robar-titulo">¿A quién quieres robar?</DialogTitle>

            {/*Cuerpo del modal*/}
            <DialogContent>
                <Typography color="text.secondary">
                    Se le quitará un recurso al azar.
                </Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                    {jugadoresParaRobar.map((id) => {
                        const jugador = jugadores[id];
                        const fondo = colorDelJugador(jugadores, id);
                        const texto = colorTextoSobre(jugador?.color ?? COLOR.SIN_COLOR);
                        return (
                            // Cada jugador con el color que eligio en la sala de espera
                            <Button
                                key={id}
                                variant="contained"
                                disabled={enviando}
                                onClick={() => onRobar(id)}
                                sx={{
                                    justifyContent: 'space-between',
                                    textTransform: 'none',
                                    bgcolor: fondo,
                                    color: texto,
                                    '&:hover': { bgcolor: fondo, filter: 'brightness(0.92)' },
                                }}
                            >
                                <span className="fw-semibold text-truncate">{jugador?.nombre ?? id}</span>
                                {/* Fondo blanco para que el icono no se pierda con el color del jugador */}
                                {jugador && (
                                    <span className="bg-white text-dark rounded-pill px-2 flex-shrink-0">
                                        <ContadorIcono
                                            icono={ICONO_RECURSOS}
                                            cantidad={totalRecursos(jugador)}
                                            descripcion={`Recursos de ${jugador.nombre}`}
                                            tam={20}
                                        />
                                    </span>
                                )}
                            </Button>
                        );
                    })}
                </Stack>
            </DialogContent>
        </Dialog>
    )
}

export default ElegirRobo;
