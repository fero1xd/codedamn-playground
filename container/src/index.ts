import { WebSocketServer } from 'ws';
import { parseJSON } from './utils';
import { parseMessage, sendResponse } from './ws';
import { IncomingMessage, OutgoingMessageType } from './types';
import { generateFileTree, getFileContent } from './fs';
import { TerminalManager } from './sessions';
import { v4 } from 'uuid';

const main = () => {
  const wss = new WebSocketServer({
    port: 3001,
    host: '0.0.0.0',
  });

  const terminalManager = new TerminalManager();

  // TODO: Add authentication
  wss.on('connection', (ws) => {
    const wsId = v4();

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
          break;

        case IncomingMessage.TERMINAL_SESSION_START:
          await terminalManager.createPty(wsId, (data) => {
            sendResponse(
              { serverEvent: OutgoingMessageType.TERMINAL_DATA, data },
              ws
            );
          });
          sendResponse({ nonce: message.nonce, data: 'OK' }, ws);
          break;

        case IncomingMessage.TERMINAL_USER_CMD:
          terminalManager.write(wsId, message.cmd);
          break;
        case IncomingMessage.RESIZE_TERMINAL:
          terminalManager.resize(wsId, message.data);
      }
    });
  });

  wss.on('listening', () => {
    console.log('Container listening on port 3000');
  });

  console.log('here');
};

main();
