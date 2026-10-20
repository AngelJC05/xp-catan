import { useState, type ReactNode } from "react";
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography,
} from "@mui/material";
import type { Jugadores, Recurso, Recursos } from "../common/jugador";
import { RECURSOS } from "../common/jugador";
import { describirRecursos, type Oferta } from "../common/partida";

// Lo que espera msgIntercambiarJugador en CatanRoom.
export interface Propuesta {
    recursoEntregado: Recurso;
    cantidadEntregada: number;
    recursoRecibido: Recurso;
    cantidadRecibida: number;
}

// Cantidad maxima que se puede pedir: la banca empieza con 19 de cada recurso.
const MAXIMO_PEDIR = 19;

const numeros = (hasta: number) => Array.from({ length: hasta }, (_, i) => i + 1);

interface Props {
    children?: ReactNode;
    // La oferta que esta sobre la mesa, o null si no hay ninguna activa.
    ofertaActiva: Oferta | null;
    jugadores: Jugadores;
    misRecursos?: Recursos;
    puedeProponer: boolean;
    enviando: boolean;
    onProponer: (propuesta: Propuesta) => void;
}

//* Area de negociar: proponer un intercambio a los demas jugadores y ver el activo

function ProponerIntercambio({ children, ofertaActiva, jugadores, misRecursos, puedeProponer, enviando, onProponer }: Props) {
    const [abierto, setAbierto] = useState(false);
    const [entregado, setEntregado] = useState<Recurso | ''>('');
    const [cantidadEntregada, setCantidadEntregada] = useState(1);
    const [recibido, setRecibido] = useState<Recurso | ''>('');
    const [cantidadRecibida, setCantidadRecibida] = useState(1);

    // Solo se puede ofrecer un recurso que se tenga, y hasta la cantidad que se tiene.
    const recursosQueTengo = RECURSOS.filter((r) => (misRecursos?.[r] ?? 0) > 0);
    const maximoDar = entregado ? (misRecursos?.[entregado] ?? 0) : 0;
    const valida = entregado !== '' && recibido !== '' && entregado !== recibido
        && cantidadEntregada >= 1 && cantidadEntregada <= maximoDar;

    function abrir() {
        setEntregado('');
        setCantidadEntregada(1);
        setRecibido('');
        setCantidadRecibida(1);
        setAbierto(true);
    }

    function confirmar() {
        if (!valida) return;
        onProponer({ recursoEntregado: entregado, cantidadEntregada, recursoRecibido: recibido, cantidadRecibida });
        setAbierto(false);
    }

    return (
        <div className="h-100 w-100 d-flex flex-column border rounded bg-white overflow-hidden">
            <h3 className="text-center fs-6 fw-bold border-bottom mb-0 py-1">Negociar</h3>

            <div className="flex-fill d-flex flex-column justify-content-center gap-2 p-2 text-center">
                {ofertaActiva ? (
                    <Typography variant="body2">
                        <strong>{jugadores[ofertaActiva.jugador]?.nombre ?? 'Un jugador'}</strong> ofrece{' '}
                        <strong>{describirRecursos(ofertaActiva.recursosOfrecidos)}</strong> por{' '}
                        <strong>{describirRecursos(ofertaActiva.recursosSolicitados)}</strong>.
                        <br />
                        <small className="text-body-secondary">Propuesta activa</small>
                    </Typography>
                ) : (
                    <small className="text-body-secondary">No hay propuestas activas.</small>
                )}

                <Button variant="outlined" size="small" disabled={!puedeProponer || enviando} onClick={abrir}>
                    {enviando ? 'Enviando propuesta…' : 'Proponer intercambio'}
                </Button>
                {children}
            </div>

            <Dialog open={abierto} onClose={() => setAbierto(false)} fullWidth maxWidth="xs" aria-labelledby="proponer-titulo">
                {/*Titulo del modal*/}
                <DialogTitle id="proponer-titulo">Proponer intercambio</DialogTitle>

                {/*Cuerpo del modal*/}
                <DialogContent>
                    <Typography color="text.secondary">
                        Indica qué recurso das y cuál pides. Los demás jugadores verán la propuesta.
                    </Typography>

                    <Typography variant="subtitle2" sx={{ mt: 2 }}>Doy</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <TextField
                            select fullWidth size="small" label="Recurso"
                            value={entregado}
                            onChange={(e) => {
                                const r = e.target.value as Recurso;
                                setEntregado(r);
                                setCantidadEntregada(1);
                                if (r === recibido) setRecibido('');
                            }}
                        >
                            {recursosQueTengo.map((r) => (
                                <MenuItem key={r} value={r} className="text-capitalize">
                                    {r} (tienes {misRecursos?.[r] ?? 0})
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select size="small" label="Cantidad" sx={{ minWidth: 100 }}
                            value={cantidadEntregada}
                            disabled={entregado === ''}
                            onChange={(e) => setCantidadEntregada(Number(e.target.value))}
                        >
                            {numeros(Math.max(maximoDar, 1)).map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                        </TextField>
                    </Stack>

                    <Typography variant="subtitle2" sx={{ mt: 2 }}>Pido</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <TextField
                            select fullWidth size="small" label="Recurso"
                            value={recibido}
                            onChange={(e) => setRecibido(e.target.value as Recurso)}
                        >
                            {RECURSOS.filter((r) => r !== entregado).map((r) => (
                                <MenuItem key={r} value={r} className="text-capitalize">{r}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select size="small" label="Cantidad" sx={{ minWidth: 100 }}
                            value={cantidadRecibida}
                            onChange={(e) => setCantidadRecibida(Number(e.target.value))}
                        >
                            {numeros(MAXIMO_PEDIR).map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAbierto(false)}>Cancelar</Button>
                    <Button variant="contained" disabled={!valida} onClick={confirmar}>
                        Proponer
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ProponerIntercambio;
