import { useEffect, useRef, useState } from "react";
import type { Room } from "@colyseus/sdk";
import "./SalaEspera.css";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { COLORES } from "../../common/jugador";
import type { InfoSala } from "../sesionGuardada";

export interface JugadorVista {
  sessionId: string;
  nombre: string;
  color: number;
  score: number;
  esUsuarioActual: boolean;
  esSuTurno: boolean;
}

interface SalaEsperaProps {
  room: Room;
  // Alias, privacidad y código: el cliente no los recibe en el estado, así
  // que Navegacion los guarda al crear o entrar. Puede ser null si faltan.
  infoSala: InfoSala | null;
  jugadores: JugadorVista[];
  maxJugadores: number;
  minJugadores: number;
  esCreador: boolean;
  onIniciarPartida: () => void;
  onSalir: () => void;
}

function iniciales(texto: string): string {
  return texto.slice(0, 2).toUpperCase();
}

type Copiado = "id" | "codigo" | null;

function SalaEspera({
  room,
  infoSala,
  jugadores,
  maxJugadores,
  minJugadores,
  esCreador,
  onIniciarPartida,
  onSalir,
}: SalaEsperaProps) {
  const [copiado, setCopiado] = useState<Copiado>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const puedeIniciar = jugadores.length >= minJugadores;

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  async function copiar(texto: string, cual: Exclude<Copiado, null>) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(cual);
      if (temporizador.current) clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => setCopiado(null), 2000);
    } catch {
      // Si el navegador bloquea el portapapeles, el texto sigue visible
      // y se puede copiar a mano.
    }
  }

  // Un "asiento" por cada cupo de la sala: si hay jugador lo mostramos,
  // si no, un asiento vacío que indica que todavía se espera a alguien.
  const asientos = Array.from({ length: maxJugadores }, (_, i) => jugadores[i] ?? null);

  return (
    <div className="bg-info-subtle min-vh-100 d-flex align-items-center justify-content-center px-3 py-4">
      <Card variant="outlined" className="w-100 sala-espera__card">
        <CardContent className="d-flex flex-column align-items-center text-center p-4">
          <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
            <Chip label="⏳ Sala de espera" color="primary" variant="outlined" size="small" />
            {infoSala && (
              <Chip
                label={infoSala.privada ? "🔒 Privada" : "🌍 Pública"}
                color={infoSala.privada ? "error" : "success"}
                variant="outlined"
                size="small"
              />
            )}
          </div>

          <Typography variant="h4" component="h1" className="text-break">
            {infoSala?.alias || "Esperando jugadores"}
          </Typography>
          <p className="text-body-secondary mb-3">
            <strong>{jugadores.length}</strong> de {maxJugadores} colonos en la isla
          </p>

          {/* Barra de progreso de Bootstrap partida en un tramo por asiento.
              Los tramos ocupados se pintan con el color del jugador. */}
          <div className="d-flex gap-2 w-100 mb-4" aria-hidden="true">
            {asientos.map((jugador, i) => (
              <div key={i} className="progress flex-fill">
                {jugador && (
                  <div className="progress-bar w-100" style={{ backgroundColor: COLORES[i % COLORES.length] }} />
                )}
              </div>
            ))}
          </div>

          <div className="w-100 mb-4">
            <ul className="row g-3 list-unstyled mb-0">
              {asientos.map((jugador, i) =>
                jugador ? (
                  <li key={jugador.sessionId} className="col-6 col-sm-3">
                    <Card variant="outlined" className="h-100">
                      <CardContent className="d-flex flex-column align-items-center gap-2 p-3">
                        <Avatar sx={{ bgcolor: COLORES[i % COLORES.length], width: 52, height: 52 }}>
                          {iniciales(jugador.nombre || jugador.sessionId)}
                        </Avatar>
                        <span className="fw-bold small text-truncate mw-100" title={jugador.nombre}>
                          {jugador.nombre}
                        </span>
                        {jugador.esUsuarioActual && <Chip label="Tú" color="info" size="small" />}
                      </CardContent>
                    </Card>
                  </li>
                ) : (
                  <li key={`vacio-${i}`} className="col-6 col-sm-3">
                    {/* Asiento libre: borde punteado y un "?" en lugar de las iniciales. */}
                    <Card variant="outlined" className="h-100" sx={{ borderStyle: "dashed" }}>
                      <CardContent className="d-flex flex-column align-items-center gap-2 p-3">
                        <Avatar sx={{ width: 52, height: 52 }}>?</Avatar>
                        <span className="small text-body-secondary">Esperando…</span>
                      </CardContent>
                    </Card>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="w-100 d-flex flex-column gap-2 mb-4">
            <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2 p-3 border rounded text-start bg-body-tertiary">
              <div className="flex-grow-1 text-break">
                <Typography variant="overline" component="div" color="text.secondary">
                  Identificador de sala
                </Typography>
                <code className="fs-5 fw-bold text-body">{room.roomId}</code>
              </div>
              <Button
                variant="outlined"
                size="small"
                className="text-nowrap"
                onClick={() => copiar(room.roomId, "id")}
                aria-label="Copiar identificador de sala"
              >
                {copiado === "id" ? "✔ ¡Copiado!" : "📋 Copiar"}
              </Button>
            </div>

            {/* El código solo lo conoce quien lo escribió (creador o quien entró con él). */}
            {infoSala?.privada && infoSala.codigoAcceso && (
              <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2 p-3 border border-danger-subtle rounded text-start bg-danger-subtle">
                <div className="flex-grow-1 text-break">
                  <Typography variant="overline" component="div" color="text.secondary">
                    Código de acceso
                  </Typography>
                  <code className="fs-5 fw-bold text-body">{infoSala.codigoAcceso}</code>
                </div>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  className="text-nowrap"
                  onClick={() => copiar(infoSala.codigoAcceso ?? "", "codigo")}
                  aria-label="Copiar código de acceso"
                >
                  {copiado === "codigo" ? "✔ ¡Copiado!" : "📋 Copiar"}
                </Button>
              </div>
            )}
          </div>

          {esCreador ? (
            <>
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                onClick={onIniciarPartida}
                disabled={!puedeIniciar}
              >
                🎲 Iniciar partida
              </Button>
              <small className="text-body-secondary mt-2 mb-2">
                {puedeIniciar
                  ? "Puedes iniciar ahora o esperar a que se unan más jugadores."
                  : `Se necesitan al menos ${minJugadores} jugadores para iniciar.`}
              </small>
            </>
          ) : (
            <Alert severity="info" className="w-100 mb-2 text-start">
              Esperando a que el anfitrión inicie la partida…
            </Alert>
          )}

          <Button variant="text" color="error" onClick={onSalir}>
            Salir de la sala
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default SalaEspera;
