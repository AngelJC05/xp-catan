import { useState, type ReactNode } from "react";
import { Button, Typography } from "@mui/material";
import type { Jugadores, Recursos } from "../common/jugador";
import type { Oferta, Propuesta } from "../common/partida";
import ListaRecursos from "./ListaRecursos";
import ProponerIntercambioDialogo from "./ProponerIntercambioDialogo";

interface Props {
    children?: ReactNode;
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

    const abrir = () => setAbierto(true);

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

            <ProponerIntercambioDialogo
                abierto={abierto}
                misRecursos={misRecursos}
                onCerrar={() => setAbierto(false)}
                onProponer={onProponer}
            />
        </div>
    );
}

export default ProponerIntercambio;
