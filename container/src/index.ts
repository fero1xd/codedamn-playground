import { WebSocketServer } from 'ws';
import { parseJSON } from './utils';
import { parseMessage } from './ws';

const main = () => {
  const wss = new WebSocketServer({
    port: 3000,
  });

  // TODO: Add authentication
  wss.on('connection', (ws) => {
    ws.on('message', function (data, isBinary) {
      if (isBinary) return;

      const raw = data.toString();
      const { success, data: json } = parseJSON(raw);
      const { success: zodSuccess, data: message } = parseMessage(json);

      if (!success || !zodSuccess) {
        return;
      }

      console.log(message);
    });
  });

  wss.on('listening', () => {
    console.log('Container listening on port 3000');
  });
};

main();
