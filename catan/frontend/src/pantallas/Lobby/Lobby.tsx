import { useState, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ICONO_UI } from "../../common/iconos";
import Icono from "../../componentes/Icono";
import type { InfoSala } from "../../servicios/sesionGuardada";
import { ERROR_CODIGO_INCORRECTO, validarCodigoAcceso } from "../../utils/validacionSala";
import { useSalasLobby } from "./hooks/useSalasLobby";
import { useDebounce } from "./hooks/useDebounce";
import TarjetaSala from "./componentes/TarjetaSala";
import DialogoCodigo from "./componentes/DialogoCodigo";
import { filtrarPorNombre, type SalaDisponible, type SalaPorCodigo } from "./utils/salas";

interface LobbyProps {
  onCrearSala: () => void;
  // Devuelve null si se entró a la sala, o el mensaje de error a mostrar.
  onUnirseASala: (id: string, info: InfoSala) => Promise<string | null>;
  onVolver?: () => void;
}

function Lobby({ onCrearSala, onUnirseASala, onVolver }: LobbyProps) {
  const [idInput, setIdInput] = useState("");
  const [salaSeleccionada, setSalaSeleccionada] = useState<string | null>(null);
  const { conexion, todasLasSalas, salas } = useSalasLobby();
  // Buscador: se filtra cuando el jugador deja de escribir.
  const [busqueda, setBusqueda] = useState("");
  const busquedaEstable = useDebounce(busqueda);
  const salasFiltradas = filtrarPorNombre(salas, busquedaEstable);
  // id de la sala a la que se está entrando, para bloquear clics repetidos.
  const [uniendo, setUniendo] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  // Diálogo del código de acceso.
  const [salaPorCodigo, setSalaPorCodigo] = useState<SalaPorCodigo | null>(null);
  const [codigoAcceso, setCodigoAcceso] = useState("");
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null);

  function seleccionarSala(sala: SalaDisponible) {
    setSalaSeleccionada(sala.id);
    setIdInput(sala.id);
  }

  function abrirDialogo(sala: SalaPorCodigo, error: string | null = null) {
    setSalaPorCodigo(sala);
    setCodigoAcceso("");
    setErrorCodigo(error);
  }

  function cerrarDialogo() {
    setSalaPorCodigo(null);
    setCodigoAcceso("");
    setErrorCodigo(null);
  }

  async function intentarUnirse(id: string) {
    if (uniendo) return;
    const sala = todasLasSalas.find((s) => s.id === id);

    // Las privadas piden el código antes de intentar entrar.
    if (sala?.tipo === "privada") {
      abrirDialogo({ id, nombre: sala.nombre });
      return;
    }

    setUniendo(id);
    setErrorGeneral(null);
    const error = await onUnirseASala(id, { alias: sala?.nombre ?? "", privada: false });
    // Sin error Navegacion ya cambió de pantalla y este componente no existe.
    if (!error) return;
    setUniendo(null);

    // Una sala escrita a mano que no está en el listado puede ser privada:
    // el backend la rechaza y entonces sí pedimos el código.
    if (error === ERROR_CODIGO_INCORRECTO) {
      abrirDialogo({ id, nombre: sala?.nombre ?? "" }, "Esta sala es privada: escribe su código de acceso.");
    } else {
      setErrorGeneral(error);
    }
  }

  async function enviarCodigo(e: FormEvent) {
    e.preventDefault();
    if (!salaPorCodigo || uniendo) return;

    const errorFormato = validarCodigoAcceso(codigoAcceso);
    if (errorFormato) {
      setErrorCodigo(errorFormato);
      return;
    }

    setUniendo(salaPorCodigo.id);
    setErrorCodigo(null);
    const error = await onUnirseASala(salaPorCodigo.id, {
      alias: salaPorCodigo.nombre,
      privada: true,
      codigoAcceso,
    });
    if (!error) return;
    setUniendo(null);
    setErrorCodigo(error);
  }

  function unirseManual() {
    const id = idInput.trim();
    if (id) intentarUnirse(id);
  }

  return (
    <div className="bg-info-subtle min-vh-100 px-3 py-4">
      <Container maxWidth="md" disableGutters className="d-flex flex-column align-items-start">
        {onVolver && (
          <Button variant="text" onClick={onVolver} startIcon={<Icono ruta={ICONO_UI.atras} />}>
            Volver
          </Button>
        )}

        <header className="mt-4 mb-4">
          <Typography variant="h4" component="h1" gutterBottom>
            Puerto de partidas
          </Typography>
          <p className="mb-0 text-body-secondary">Elige una sala para zarpar, o funda la tuya.</p>
        </header>

        <Card variant="outlined" className="w-100 mb-3">
          <CardContent
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              unirseManual();
            }}
          >
            <label className="d-block fw-semibold mb-2" htmlFor="id-sala">
              ¿Te pasaron el identificador de una sala?
            </label>
            <div className="d-flex flex-column flex-sm-row gap-2">
              <TextField
                id="id-sala"
                placeholder="Identificador de sala"
                size="small"
                className="flex-grow-1"
                autoComplete="off"
                value={idInput}
                onChange={(e) => {
                  setIdInput(e.target.value);
                  setSalaSeleccionada(null);
                }}
                slotProps={{ htmlInput: { spellCheck: false } }}
                sx={{ "& .MuiInputBase-input": { fontFamily: "monospace" } }}
              />
              <Button type="submit" variant="contained" disabled={!idInput.trim() || uniendo !== null}>
                Unirse
              </Button>
            </div>
          </CardContent>
        </Card>

        {errorGeneral && (
          <Alert severity="error" className="w-100 mb-3">
            {errorGeneral}
          </Alert>
        )}

        <section className="w-100 mt-2">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <Typography variant="h5" component="h2">
              Salas disponibles
            </Typography>
            {conexion === "conectado" && <Chip label="En vivo" color="success" variant="outlined" size="small" />}
          </div>

          {conexion === "conectando" ? (
            <Card variant="outlined" className="mb-4">
              <CardContent className="d-flex align-items-center justify-content-center gap-2 text-body-secondary">
                <CircularProgress size={20} /> Buscando salas…
              </CardContent>
            </Card>
          ) : conexion === "error" ? (
            <Alert severity="error" className="mb-4">
              No se pudo conectar con el servidor. Revisa que el backend esté encendido.
            </Alert>
          ) : salas.length === 0 ? (
            <Card variant="outlined" className="mb-4">
              <CardContent className="text-center fw-semibold text-body-secondary">
                No hay salas abiertas. ¡Crea una para empezar a jugar!
              </CardContent>
            </Card>
          ) : (
            <>
              <TextField
                type="search"
                label="Buscar sala por nombre"
                size="small"
                fullWidth
                autoComplete="off"
                className="mb-3"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

              {salasFiltradas.length === 0 ? (
                <Card variant="outlined" className="mb-4">
                  <CardContent className="text-center fw-semibold text-body-secondary">
                    No hay salas que coincidan con «{busquedaEstable.trim()}».
                  </CardContent>
                </Card>
              ) : (
                <ul className="row g-3 list-unstyled mb-4">
                  {salasFiltradas.map((sala) => (
                    <li key={sala.id} className="col-12 col-md-6">
                      <TarjetaSala
                        sala={sala}
                        seleccionada={salaSeleccionada === sala.id}
                        uniendo={uniendo}
                        onSeleccionar={() => seleccionarSala(sala)}
                        onUnirse={() => intentarUnirse(sala.id)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

        <Button variant="contained" color="error" fullWidth size="large" onClick={onCrearSala} startIcon={<Icono ruta={ICONO_UI.martillo} tam={22} />}>
          Crear nueva sala
        </Button>
      </Container>

      <DialogoCodigo
        sala={salaPorCodigo}
        codigo={codigoAcceso}
        error={errorCodigo}
        uniendo={uniendo}
        onCambiarCodigo={(codigo) => {
          setCodigoAcceso(codigo);
          setErrorCodigo(null);
        }}
        onCerrar={cerrarDialogo}
        onEnviar={enviarCodigo}
      />
    </div>
  );
}

export default Lobby;
