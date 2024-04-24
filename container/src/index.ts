import { WebSocketServer } from 'ws';
import { parseJSON } from './utils';
import { parseMessage, sendResponse } from './ws';
import { IncomingMessage, OutgoingMessageType } from './types';
import { generateFileTree, getFileContent, watchForDepsChange } from './fs';
import { TerminalManager } from './sessions';
import { v4 } from 'uuid';
import { env } from './env';
import path from 'path';

const main = () => {
  const wss = new WebSocketServer({
    port: 3001,
    host: '0.0.0.0',
  });

  const terminalManager = new TerminalManager();

  let idleTimeout: NodeJS.Timeout | null = null;

  const terminateProcess = () => {
    console.log('Idle container exiting it');
    if (wss.clients.size > 0) {
      console.log('users are doing nothing... pause the container here');
      // Todo: 'pause" the container here
      return;
    }

    process.exit(0);
  };

  const resetIdleTimeout = () => {
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(terminateProcess, idleInterval);
  };

  const idleInterval = 120 * 1000;

  watchForDepsChange(path.join(env.WORK_DIR, env.DEPS_FILE), (deps) => {
    wss.clients.forEach((c) => {
      sendResponse(
        {
          serverEvent: OutgoingMessageType.INSTALL_DEPS,
          data: deps,
        },
        c
      );
    });
  });

  resetIdleTimeout();

  // TODO: Add authentication
  wss.on('connection', (ws) => {
    const wsId = v4();
    resetIdleTimeout();

    getFileContent(path.join(env.WORK_DIR, env.DEPS_FILE)).then((deps) => {
      const json = JSON.parse(deps);

      sendResponse(
        {
          serverEvent: OutgoingMessageType.INSTALL_DEPS,
          data: {
            dependencies: json.dependencies || {},
            devDependencies: json.devDependencies || {},
          },
        },
        ws
      );
    });

    ws.on('message', async (data, isBinary) => {
      if (isBinary) return;
      resetIdleTimeout();
      const raw = data.toString();
      const { success, data: json } = parseJSON(raw);
      const { success: zodSuccess, data: message } = parseMessage(json);

      if (!success || !zodSuccess) {
        console.log('invalid ws message');
        return;
      }

      switch (message?.event) {
        case IncomingMessage.GENERATE_TREE:
          sendResponse(
            {
              nonce: message.nonce,
              data: await generateFileTree(message?.data?.path || env.WORK_DIR),
            },
            ws
          );
          break;

        case IncomingMessage.FILE_CONTENT:
          sendResponse(
            {
              nonce: message.nonce,
              data: await getFileContent(message.data.filePath),
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
          terminalManager.write(wsId, message.data.cmd);
          break;
        case IncomingMessage.RESIZE_TERMINAL:
          terminalManager.resize(wsId, message.data);
      }
    });
  });

  wss.on('listening', () => {
    console.log('Container listening on port 3000');
  });
};

main();
