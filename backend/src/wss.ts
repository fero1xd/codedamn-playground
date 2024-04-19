import { WebSocketServer } from 'ws';
import { createPlayground } from './docker';

export function createWSS() {
  const port = 3001;
  const wss = new WebSocketServer({
    port,
  });

  wss.on('connection', (w) => {
    createPlayground(w);
  });

  wss.on('listening', () => {
    console.log('listening wss on port ' + port);
  });
}
