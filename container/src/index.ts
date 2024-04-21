import { WebSocketServer } from 'ws';
import { parseJSON } from './utils';
import { parseMessage, sendResponse } from './ws';
import { IncomingMessage } from './types';
import { generateFileTree, getFileContent } from './fs';

const main = () => {
  const wss = new WebSocketServer({
    port: 3000,
    host: '0.0.0.0',
  });

  // TODO: Add authentication
  wss.on('connection', (ws) => {
    console.log('got connection');
    ws.on('message', async (data, isBinary) => {
      if (isBinary) return;

      const raw = data.toString();
      const { success, data: json } = parseJSON(raw);
      const { success: zodSuccess, data: message } = parseMessage(json);

      if (!success || !zodSuccess) {
        console.log('invalid ws message');
        return;
      }

      switch (message?.event) {
        case IncomingMessage.GENERATE_ROOT_TREE:
          sendResponse(
            {
              nonce: message.nonce,
              data: await generateFileTree(process.env.WORK_DIR!),
            },
            ws
          );
          break;

        case IncomingMessage.GENERATE_TREE:
          sendResponse(
            {
              nonce: message.nonce,
              data: await generateFileTree(message.path),
            },
            ws
          );
          break;

        case IncomingMessage.FILE_CONTENT:
          sendResponse(
            {
              nonce: message.nonce,
              data: await getFileContent(message.filePath),
            },
            ws
          );
      }
    });
  });

  wss.on('listening', () => {
    console.log('Container listening on port 3000');
  });

  console.log('here');
};

main();
