import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { DESARROLLADORES, LIDERAZGO, PAREJA_XP } from "../datos/equipo";
import { colorParaNombre, iniciales } from "../utils/avatar";

export default function EquipoCard() {
  return (
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
  );
}
