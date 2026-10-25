import { useState } from "react";
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography,
} from "@mui/material";
import type { Recurso, Recursos } from "../common/jugador";
import { RECURSOS } from "../common/jugador";
import type { Propuesta } from "../common/partida";

// Cantidad maxima que se puede pedir: la banca empieza con 19 de cada recurso.
const MAXIMO_PEDIR = 19;

// Una funcion que devuelve un arreglo de [max+1] rellenado de 0 a max
const numeros = (max: number) => Array.from(
    { length: max + 1 },
    (_, index) => index
)

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
                <Button onClick={onCerrar}>Cancelar</Button>
                <Button variant="contained" disabled={!valida} onClick={confirmar}>
                    Proponer
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ProponerIntercambioDialogo;
