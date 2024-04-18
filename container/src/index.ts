import { WebSocketServer } from 'ws';
import { parseJSON } from './utils';
import { parseMessage, sendResponse } from './ws';
import { IncomingMessage } from './types';
import { generateFileTree } from './fs';

const main = () => {
  const wss = new WebSocketServer({
    port: 3000,
  });

  // TODO: Add authentication
  wss.on('connection', (ws) => {
    ws.on('message', async (data, isBinary) => {
      if (isBinary) return;

      const raw = data.toString();
      const { success, data: json } = parseJSON(raw);
      const { success: zodSuccess, data: message } = parseMessage(json);

      if (!success || !zodSuccess) {
        return;
      }

      console.log(message);

      switch (message?.event) {
        case IncomingMessage.FILE_TREE:
          sendResponse(
            {
              nonce: message.nonce,
              data: await generateFileTree(),
            },
            ws
          );
      }
    });
  });

  wss.on('listening', () => {
    console.log('Container listening on port 3000');
  });
};

main();
