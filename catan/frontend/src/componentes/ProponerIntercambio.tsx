import { useState, type ReactNode } from "react";
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography,
} from "@mui/material";
import type { Jugadores, Recurso, Recursos } from "../common/jugador";
import { RECURSOS } from "../common/jugador";
import type { Oferta } from "../common/partida";
import ListaRecursos from "./ListaRecursos";

// Lo que espera msgIntercambiarJugador en CatanRoom: cada recurso con su cantidad.
export interface Propuesta {
    ofrecidos: Partial<Record<Recurso, number>>;
    solicitados: Partial<Record<Recurso, number>>;
}

// Cantidad maxima que se puede pedir: la banca empieza con 19 de cada recurso.
const MAXIMO_PEDIR = 19;

const numeros = (hasta: number) => Array.from({ length: hasta + 1 }, (_, i) => i);

const sinCantidades = (): Record<Recurso, number> => ({ madera: 0, trigo: 0, lana: 0, ladrillo: 0, mineral: 0 });

// Solo se envian los recursos con cantidad mayor a 0.
const conCantidad = (cantidades: Record<Recurso, number>) =>
    Object.fromEntries(RECURSOS.filter((r) => cantidades[r] > 0).map((r) => [r, cantidades[r]]));

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
    const [doy, setDoy] = useState(sinCantidades);
    const [pido, setPido] = useState(sinCantidades);

    // Se tiene que dar y pedir algo, y solo se puede dar hasta lo que se tiene.
    const tengo = (r: Recurso) => misRecursos?.[r] ?? 0;
    const valida = RECURSOS.some((r) => doy[r] > 0) && RECURSOS.some((r) => pido[r] > 0)
        && RECURSOS.every((r) => doy[r] <= tengo(r));

    function abrir() {
        setDoy(sinCantidades());
        setPido(sinCantidades());
        setAbierto(true);
    }

    function confirmar() {
        if (!valida) return;
        onProponer({ ofrecidos: conCantidad(doy), solicitados: conCantidad(pido) });
        setAbierto(false);
    }

    return (
        <div className="h-100 w-100 d-flex flex-column border rounded bg-white overflow-hidden">
            <h3 className="text-center fs-6 fw-bold border-bottom mb-0 py-1">Negociar</h3>

            <div className="flex-fill d-flex flex-column justify-content-center gap-2 p-2 text-center">
                {ofertaActiva ? (
                    <Typography variant="body2" component="div">
                        <strong>{jugadores[ofertaActiva.jugador]?.nombre ?? 'Un jugador'}</strong> ofrece
                        <div>
                            <ListaRecursos recursos={ofertaActiva.recursosOfrecidos} />
                        </div>
                        y quiere
                        <div>
                            <ListaRecursos recursos={ofertaActiva.recursosSolicitados} />
                        </div>
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
                        Indica cuánto das y cuánto pides de cada recurso. Un recurso no puede ir en los dos lados.
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ flex: 1 }}>Recurso</Typography>
                        <Typography variant="subtitle2" sx={{ width: 90, textAlign: 'center' }}>Doy</Typography>
                        <Typography variant="subtitle2" sx={{ width: 90, textAlign: 'center' }}>Pido</Typography>
                    </Stack>
                    {/* Una fila por recurso: si se da no se puede pedir y al reves */}
                    {RECURSOS.map((r) => (
                        <Stack key={r} direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ flex: 1 }}>
                                <span className="text-capitalize">{r}</span> (tienes {tengo(r)})
                            </Typography>
                            <TextField
                                select size="small" sx={{ width: 90 }}
                                value={doy[r]}
                                disabled={tengo(r) === 0 || pido[r] > 0}
                                onChange={(e) => setDoy({ ...doy, [r]: Number(e.target.value) })}
                            >
                                {numeros(tengo(r)).map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                            </TextField>
                            <TextField
                                select size="small" sx={{ width: 90 }}
                                value={pido[r]}
                                disabled={doy[r] > 0}
                                onChange={(e) => setPido({ ...pido, [r]: Number(e.target.value) })}
                            >
                                {numeros(MAXIMO_PEDIR).map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                            </TextField>
                        </Stack>
                    ))}
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
