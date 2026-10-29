import { useState, type ReactNode } from "react";
import { Button, Typography } from "@mui/material";
import type { Jugadores, Recursos } from "../../../../../common/jugador";
import type { Oferta, Propuesta } from "../../../tipos/partida";
import ListaRecursos from "../ListaRecursos";
import ProponerIntercambioDialogo from "./componentes/ProponerIntercambioDialogo";

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

            <div className="flex-fill d-flex align-items-center gap-2 p-2 overflow-y-auto">
                {/* Izquierda: la propuesta activa, si hay */}
                <div className="flex-fill min-w-0 text-center">
                    {ofertaActiva ? (
                        <Typography variant="body2" component="div">
                            <small className="text-body-secondary">
                                Propuesta de <strong>{jugadores[ofertaActiva.jugador]?.nombre ?? 'un jugador'}</strong>
                            </small>
                            <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
                                <ListaRecursos recursos={ofertaActiva.recursosOfrecidos} />
                                <span role="img" aria-label="a cambio de" title="a cambio de" className="text-body-secondary">⇄</span>
                                <ListaRecursos recursos={ofertaActiva.recursosSolicitados} />
                            </div>
                        </Typography>
                    ) : (
                        <small className="text-body-secondary">No hay propuestas activas.</small>
                    )}
                </div>

                {/* Derecha: con quién negociar */}
                <div className="d-flex flex-column gap-2 flex-shrink-0">
                    <Button variant="outlined" size="small" disabled={!puedeProponer || enviando} onClick={abrir}>
                        {enviando ? 'Enviando…' : 'Jugadores'}
                    </Button>
                    {children}
                </div>
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
