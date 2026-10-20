import "./Home.css";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import HexIsla from "./componentes/HexIsla";
import { DESARROLLADORES, LIDERAZGO, PAREJA_XP } from "./datos/equipo";
import { colorParaNombre, iniciales } from "./utils/avatar";

interface HomeProps {
  onAbrirMenu: () => void;
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
