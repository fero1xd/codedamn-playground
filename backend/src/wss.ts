import { WebSocketServer } from 'ws';
import { createPlayground } from './docker';

export function createWSS() {
  const wss = new WebSocketServer({
    port: 3001,
  });

  wss.on('connection', (w) => {
    createPlayground(w);
  });

  wss.on('listening', () => {
    console.log('listening wss on port 3001');
  });
}
