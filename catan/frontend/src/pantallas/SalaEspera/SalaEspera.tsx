import type { Room } from "@colyseus/sdk";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { hexDeColor } from "../../common/colores";
import Chat, { type LineaRegistro } from "../../componentes/chat";
import type { InfoSala } from "../sesionGuardada";
import type { JugadorVista } from "./tipos";
import TarjetaJugador from "./componentes/TarjetaJugador";
import AsientoVacio from "./componentes/AsientoVacio";
import CampoCopiable from "./componentes/CampoCopiable";

interface SalaEsperaProps {
  room: Room;
  infoSala: InfoSala | null;
  jugadores: JugadorVista[];
  maxJugadores: number;
  minJugadores: number;
  esCreador: boolean;
  registro: LineaRegistro[];
  onIniciarPartida: () => void;
  onSalir: () => void;
}

function SalaEspera({
  room,
  infoSala,
  jugadores,
  maxJugadores,
  minJugadores,
  esCreador,
  registro,
  onIniciarPartida,
  onSalir,
}: SalaEsperaProps) {
  const puedeIniciar = jugadores.length >= minJugadores;

  // Un "asiento" por cada cupo de la sala: si hay jugador lo mostramos,
  // si no, un asiento vacío que indica que todavía se espera a alguien.
  const asientos = Array.from({ length: maxJugadores }, (_, i) => jugadores[i] ?? null);

  return (
    <div className="bg-info-subtle min-vh-100 d-flex align-items-center justify-content-center px-3 py-4">
      <div className="row g-3 w-100 justify-content-center" style={{ maxWidth: 960 }}>
        <div className="col-12 col-lg-7">
          <Card variant="outlined" className="h-100">
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
                      <div className="progress-bar w-100" style={{ backgroundColor: hexDeColor(jugador.color) }} />
                    )}
                  </div>
                ))}
              </div>

              <div className="w-100 mb-4">
                <ul className="row g-3 list-unstyled mb-0">
                  {asientos.map((jugador, i) =>
                    jugador ? (
                      <TarjetaJugador
                        key={jugador.sessionId}
                        jugador={jugador}
                        ocupados={jugadores
                          .filter((otro) => otro.sessionId !== jugador.sessionId)
                          .map((otro) => otro.color)}
                        onElegirColor={(color) => room.send("msgElegirColor", { color })}
                      />
                    ) : (
                      <AsientoVacio key={`vacio-${i}`} />
                    )
                  )}
                </ul>
              </div>

              <div className="w-100 d-flex flex-column gap-2 mb-4">
                <CampoCopiable
                  etiqueta="Identificador de sala"
                  valor={room.roomId}
                  descripcionBoton="Copiar identificador de sala"
                />

                {/* El código solo lo conoce quien lo escribió (creador o quien entró con él). */}
                {infoSala?.privada && infoSala.codigoAcceso && (
                  <CampoCopiable
                    etiqueta="Código de acceso"
                    valor={infoSala.codigoAcceso}
                    descripcionBoton="Copiar código de acceso"
                    destacado
                  />
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

        <div className="col-12 col-lg-5 align-self-lg-start">
          <div style={{ height: 420 }}>
            <Chat
              registro={registro}
              onEnviar={(mensaje) => room.send("msgChat", { mensaje })}
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default SalaEspera;
