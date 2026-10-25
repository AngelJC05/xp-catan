import { IconButton, Stack } from "@mui/material";
import { ICONO_UI } from "../common/iconos";
import Icono from "./Icono";
import type { Recurso, Recursos } from "../common/jugador";
import type { Oferta } from "../common/partida";
import ListaRecursos from "./ListaRecursos";

// Lo que espera msgResponderIntercambio en CatanRoom: 1 acepta, -1 rechaza.
export type Respuesta = 1 | -1;

interface Props {
    oferta: Oferta;
    nombreOferente: string;
    misRecursos?: Recursos;
    enviando: boolean;
    onResponder: (respuesta: Respuesta) => void;
}

//* Se muestra a los jugadores que todavia no respondieron la propuesta activa

function ResponderIntercambio({ oferta, nombreOferente, misRecursos, enviando, onResponder }: Props) {
    /* Sin lo que se pide, aceptar no sirve: el backend lo cambia a "no". Por eso
       en ese caso solo se deja rechazar. */
    const faltantes = Object.fromEntries(
        Object.entries(oferta.recursosSolicitados ?? {})
            .map(([r, cantidad]) => [r, cantidad - (misRecursos?.[r as Recurso] ?? 0)])
            .filter(([, falta]) => (falta as number) > 0)
    );
    const alcanza = Object.keys(faltantes).length === 0;

    return (
        <div className="h-100 w-100 d-flex flex-column border rounded bg-white overflow-hidden">
            <h3 className="text-center fs-6 fw-bold border-bottom mb-0 py-1">Negociar</h3>

            <div className="flex-fill d-flex flex-column overflow-y-auto p-2 text-center">
                <div className="my-auto d-flex flex-column gap-1">
                    <small>
                        <strong>{nombreOferente}</strong> propone:
                    </small>

                    <ListaRecursos recursos={oferta.recursosOfrecidos} />
                    <span role="img" aria-label="a cambio de" title="a cambio de" className="text-body-secondary">⇄</span>
                    <ListaRecursos recursos={oferta.recursosSolicitados} />

                    {!alcanza && (
                        <small className="text-danger">
                            Te falta <ListaRecursos recursos={faltantes} />
                        </small>
                    )}

                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                        <IconButton
                            color="error"
                            disabled={enviando}
                            onClick={() => onResponder(-1)}
                            title="Rechazar propuesta"
                            aria-label="Rechazar propuesta"
                        >
                            <Icono ruta={ICONO_UI.rechazarOferta} tam={28} className={enviando ? 'opacity-50' : ''} />
                        </IconButton>
                        <IconButton
                            color="success"
                            disabled={enviando || !alcanza}
                            onClick={() => onResponder(1)}
                            title="Aceptar propuesta"
                            aria-label="Aceptar propuesta"
                        >
                            <Icono ruta={ICONO_UI.aceptarOferta} tam={28} className={enviando || !alcanza ? 'opacity-50' : ''} />
                        </IconButton>
                    </Stack>
                </div>
            </div>
        </div>
    );
}

export default ResponderIntercambio;
