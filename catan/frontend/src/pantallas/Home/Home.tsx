import "./Home.css";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import EquipoCard from "./componentes/EquipoCard";
import HexIsla from "./componentes/HexIsla";

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

      <EquipoCard />
    </div>
  );
}

export default Home;
