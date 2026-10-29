import { Client } from "@colyseus/sdk";

// Si tu backend corre en otro host o puerto, cambia esta URL.
// Nota: en producción normalmente usarás "wss://" en vez de "ws://"
export const client = new Client(
    import.meta.env.VITE_SERVER_URL || "ws://localhost:2567"
);


// en una terminal abierta en la carpeta del main ejecutar el siguiente comando
// npm install @colyseus/sdk

