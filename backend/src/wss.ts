import { WebSocketServer } from 'ws';
import { startPlaygroundBash } from './docker';

export function createWSS() {
  const port = 3001;
  const wss = new WebSocketServer({
    port,
  });

  wss.on('connection', (w) => {
    startPlaygroundBash(w);
  });

  wss.on('listening', () => {
    console.log('listening wss on port ' + port);
  });

  return wss;
}
