import "./Home.css";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { DESARROLLADORES, LIDERAZGO, PAREJA_XP } from "./datos/equipo";

interface HomeProps {
  onAbrirMenu: () => void;
}

// Tonos oscuros de los terrenos del tablero: bosque, ladrillo, trigo, mar y
// montaña. Oscuros para que las iniciales en blanco se lean bien.
const COLORES_AVATAR = ["#2f6b3f", "#b64e36", "#b07a1f", "#176977", "#5d6773"];

function colorParaNombre(nombre: string): string {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORES_AVATAR[Math.abs(hash) % COLORES_AVATAR.length];
}

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");
}

// Terreno y número de cada ficha de la isla. Los colores son los mismos
// que usa componentes/tablero.css; 6 y 8 van en rojo como en el tablero.
const FICHAS_ISLA = [
  { cx: 120, cy: 70, color: "#6ab04c", numero: 8 },
  { cx: 200, cy: 70, color: "#c96b4a", numero: 5 },
  { cx: 280, cy: 70, color: "#f6e58d", numero: 10 },
  { cx: 80, cy: 140, color: "#a5d6a7", numero: 3 },
  { cx: 160, cy: 140, color: "#9aa0a6", numero: 6 },
  { cx: 240, cy: 140, color: "#e8c97a", numero: null },
  { cx: 320, cy: 140, color: "#6ab04c", numero: 11 },
];

function HexIsla() {
  // Ilustración original inspirada en las fichas hexagonales de recursos
  // del juego (no es arte oficial de Catan).
  const puntosHex = (cx: number, cy: number) => {
    const r = 46;
    return Array.from({ length: 6 }, (_, i) => {
      const angulo = (Math.PI / 180) * (60 * i - 30);
      return `${cx + r * Math.cos(angulo)},${cy + r * Math.sin(angulo)}`;
    }).join(" ");
  };

  return (
    <svg viewBox="0 0 400 220" className="home__hex-arte" aria-hidden="true">
      {FICHAS_ISLA.map((ficha) => (
        <g key={`${ficha.cx}-${ficha.cy}`}>
          <polygon points={puntosHex(ficha.cx, ficha.cy)} fill={ficha.color} stroke="#f3ede0" strokeWidth={4} />
          {ficha.numero !== null ? (
            <>
              <circle cx={ficha.cx} cy={ficha.cy} r={15} fill="#f6efdd" stroke="#00000022" strokeWidth={1.5} />
              <text
                x={ficha.cx}
                y={ficha.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={17}
                fontWeight={600}
                fill={ficha.numero === 6 || ficha.numero === 8 ? "#b3261e" : "#2a2a2a"}
              >
                {ficha.numero}
              </text>
            </>
          ) : (
            // En el desierto empieza el ladrón.
            <g>
              <ellipse cx={ficha.cx} cy={ficha.cy + 14} rx={11} ry={5} fill="#333" />
              <ellipse cx={ficha.cx} cy={ficha.cy + 2} rx={8} ry={12} fill="#333" />
              <circle cx={ficha.cx} cy={ficha.cy - 13} r={7} fill="#333" />
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

function Home({ onAbrirMenu }: HomeProps) {
  return (
    <div className="bg-info-subtle min-vh-100 pb-5">
      <nav className="navbar bg-body-tertiary border-bottom mb-4">
        <div className="container">
          <span className="navbar-brand fw-semibold">Catan Online</span>
          <Button variant="contained" size="small" onClick={onAbrirMenu} aria-label="Abrir menú de partidas">
            Jugar
          </Button>
        </div>
      </nav>

      <header className="container text-center mb-5">
        <Chip label="Beta 1.1 · version jugable" color="primary" variant="outlined" size="small" />
        <div className="my-3">
          <HexIsla />
        </div>
        <Typography variant="h3" component="h1" gutterBottom>
          Construye, comercia, coloniza
        </Typography>
        <p className="lead mx-auto mb-4 home__texto">
          La versión en línea de Catan que estamos construyendo para jugar por
          turnos con tus amigos, desde el navegador de tu computadora.
        </p>
        <p className="text-body-secondary mx-auto mb-4 home__texto">
          Versión mejorada con Extreme Programming (XP), basada en el proyecto
          Scrum original.
        </p>
        <Button variant="contained" color="warning" size="large" onClick={onAbrirMenu}>
          Jugar ahora
        </Button>
        <Alert severity="info" className="home__texto mx-auto mt-4">
          La versión para celular aún no está preparada, por ahora se recomienda jugar desde una computadora.
        </Alert>
      </header>

      <section className="container home__equipo">
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h5" component="h2" align="center" gutterBottom>
              El equipo
            </Typography>
            <Divider className="mb-3" />

            <Typography variant="subtitle1" component="h3" color="text.secondary" className="mb-2">
              Pareja XP · versión 1.1
            </Typography>
            <ul className="list-unstyled row g-2 mb-4">
              {PAREJA_XP.map((nombre) => (
                <li className="col-12 col-sm-6" key={nombre}>
                  <div className="d-flex align-items-center gap-3 border rounded p-2 bg-light">
                    <Avatar sx={{ bgcolor: colorParaNombre(nombre) }}>{iniciales(nombre)}</Avatar>
                    <div>
                      <div className="fw-bold">{nombre}</div>
                      <small className="text-body-secondary">Programador</small>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Typography variant="subtitle1" component="h3" color="text.secondary" className="mb-2">
              Equipo Scrum original · versión 1.0
            </Typography>
            <div className="row g-3">
              {LIDERAZGO.map((persona) => (
                <div className="col-12 col-sm-6" key={persona.nombre}>
                  <div className="d-flex align-items-center gap-3 border rounded p-2 bg-light">
                    <Avatar sx={{ bgcolor: colorParaNombre(persona.nombre) }}>{iniciales(persona.nombre)}</Avatar>
                    <div>
                      <div className="fw-bold">{persona.nombre}</div>
                      <small className="text-body-secondary">{persona.rol}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Typography variant="subtitle1" component="h3" color="text.secondary" className="mt-4 mb-2">
              Desarrolladores
            </Typography>
            <ul className="list-unstyled row g-2 mb-0">
              {DESARROLLADORES.map((nombre) => (
                <li className="col-12 col-sm-6 col-md-4" key={nombre}>
                  <div className="d-flex align-items-center gap-2 border rounded p-2 bg-light">
                    <Avatar sx={{ bgcolor: colorParaNombre(nombre), width: 30, height: 30, fontSize: "0.75rem" }}>
                      {iniciales(nombre)}
                    </Avatar>
                    <span className="fw-semibold">{nombre}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default Home;
