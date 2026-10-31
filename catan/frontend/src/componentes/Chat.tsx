import { useEffect, useRef, useState } from 'react';
import { Button, Card, Form, InputGroup } from 'react-bootstrap';

// "chat" y "log", broadcast("chat", ...) y broadcast("log", ...). 
export type MensajeRegistro = { jugador: string; mensaje: string };
export type LineaRegistro = { tipo: 'chat' | 'log' } & MensajeRegistro;

type Props = {
  /* Ya convertidos a texto plano: esta lista es lo unico que se pinta. */
    registro: LineaRegistro[];
  /* Sin sala no hay a donde enviar, asi que la caja se deshabilita. */
  onEnviar?: (texto: string) => void;
};

function Chat({ registro, onEnviar }: Props) {
  const [texto, setTexto] = useState('');
  const lista = useRef<HTMLDivElement>(null);

  /* Se mueve solo el scroll de la lista; scrollIntoView movia tambien la pagina. */
  useEffect(() => {
    const elemento = lista.current;
    if (elemento) elemento.scrollTop = elemento.scrollHeight;
  }, [registro]);

  const enviar = (evento: React.FormEvent) => {
    evento.preventDefault();
    const limpio = texto.trim();
    if (!limpio || !onEnviar) return;
    onEnviar(limpio);
    setTexto('');
  };

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column p-2 overflow-hidden">
        <div ref={lista} className="flex-grow-1 overflow-auto small" role="log">
          {registro.map((linea, i) => (linea.tipo === 'chat' ? (
            <div
              key={i}
              className="px-2 mb-1 rounded bg-primary-subtle"
            >
              <span className="fw-bold">{linea.jugador}</span>: {linea.mensaje}
            </div>
          ) : (
            <div key={i} className="px-2 mb-1 rounded bg-body-secondary text-secondary fst-italic lh-sm" style={{ fontSize: '0.9rem' }}>
              <span className="fw-bold">{linea.jugador}</span>{linea.mensaje}
            </div>
          )))}
        </div>
        <Form onSubmit={enviar} className="mt-2">
          <InputGroup size="sm">
            <Form.Control
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Mensaje"
              disabled={!onEnviar}
              aria-label="Mensaje de chat"
            />
            <Button type="submit" disabled={!onEnviar || texto.trim() === ''}>
              Enviar
            </Button>
          </InputGroup>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default Chat;