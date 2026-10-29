import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import type { Recurso, Recursos } from "../../../../../../common/jugador";
import { RECURSOS } from "../../../../../../common/jugador";
import type { Propuesta } from "../../../../tipos/partida";
import { ICONO_RECURSO } from "../../../../../../common/iconos";
import Contador from "./Contador";
import Icono from "../../../../../../componentes/Icono";

// Cantidad maxima que se puede pedir: la banca empieza con 19 de cada recurso.
const MAXIMO_PEDIR = 19;

// Una funcion que devuelve un obketo de todos los recursos seteados en 0
const sinCantidades = (): Record<Recurso, number> => ({ madera: 0, trigo: 0, lana: 0, ladrillo: 0, mineral: 0 });


// Una funcion que devuelve unicamente los recursos que tienen cantidad mayoor a 0
const conCantidad = (cantidades: Record<Recurso, number>) =>
    Object.fromEntries(
        RECURSOS
        .filter((r) => cantidades[r] > 0)
        .map((r) => [r, cantidades[r]])
    );

interface Props {
    abierto: boolean;
    misRecursos?: Recursos;
    onCerrar: () => void;
    onProponer: (propuesta: Propuesta) => void;
}

//* Modal para armar la propuesta: cuanto se da y cuanto se pide de cada recurso
function ProponerIntercambioDialogo({ abierto, misRecursos, onCerrar, onProponer }: Props) {
    const [doy, setDoy] = useState(sinCantidades);
    const [pido, setPido] = useState(sinCantidades);
    const [estabaAbierto, setEstabaAbierto] = useState(abierto);

    // Cada vez que se abre vuelve a empezar con todo en 0
    if (abierto !== estabaAbierto) {
        setEstabaAbierto(abierto);
        if (abierto) {
            setDoy(sinCantidades());
            setPido(sinCantidades());
        }
    }

    // Funcion que devuelve la cantidad de un recurso del jugador o 0 si no tiene
    const tengo = (r: Recurso) => misRecursos?.[r] ?? 0;

    // Devuelve true si lo que se ofrece no es mayor a lo que se tiene y al menos uno de cada lado
    const valida = 
        RECURSOS.some( (r) => doy[r] > 0 ) 
        && RECURSOS.some( (r) => pido[r] > 0 )
        && RECURSOS.every( (r) => doy[r] <= tengo(r) );

    // Funcion que llama a onProponer y onCerrar si la propuesta es valida
    function confirmar() {
        if (!valida) return;
        onProponer({ ofrecidos: conCantidad(doy), solicitados: conCantidad(pido) });
        onCerrar();
    }

    return (
        <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="xs" aria-labelledby="proponer-titulo">
            {/*Titulo del modal*/}
            <DialogTitle id="proponer-titulo">Proponer intercambio</DialogTitle>

            {/*Cuerpo del modal*/}
            <DialogContent>
                <div className="row g-0 text-center fw-bold border-bottom pb-1">
                    <div className="col-4">Recurso</div>
                    <div className="col-4">Ofrezco</div>
                    <div className="col-4">Quiero</div>
                </div>

                {/* Una fila por recurso: si se da no se puede pedir y al reves */}
                {RECURSOS.map((r) => (
                    <div key={r} className="row g-0 align-items-center text-center py-1">
                        <div
                            className="col-4 d-flex align-items-center justify-content-center gap-1"
                            title={`Tienes ${tengo(r)} de ${r}`}
                        >
                            <Icono ruta={ICONO_RECURSO[r]} tam={30} />
                            <small className="text-body-secondary">{tengo(r)}</small>
                        </div>

                        <div className="col-4">
                            <Contador
                                valor={doy[r]}
                                maximo={tengo(r)}
                                etiqueta={r}
                                deshabilitado={tengo(r) === 0 || pido[r] > 0}
                                onCambiar={(n) => setDoy({ ...doy, [r]: n })}
                            />
                        </div>

                        <div className="col-4">
                            <Contador
                                valor={pido[r]}
                                maximo={MAXIMO_PEDIR}
                                etiqueta={r}
                                deshabilitado={doy[r] > 0}
                                onCambiar={(n) => setPido({ ...pido, [r]: n })}
                            />
                        </div>
                    </div>
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cancelar</Button>
                <Button variant="contained" disabled={!valida} onClick={confirmar}>
                    Ofrecer
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ProponerIntercambioDialogo;
