import "dotenv/config";
import { WebSocketServer } from "ws";
import { parseJSON } from "./utils";
import { parseMessage, sendResponse } from "./ws";
import {
  IncomingMessage,
  OutgoingMessageType,
  WebSocketWithKeepAlive,
} from "./types";
import { fsService } from "./fs";
import { TerminalManager } from "./sessions";
import { v4 } from "uuid";
import { env } from "./env";
import { watchPorts } from "./ports";
import { getDependenciesForPackage } from "./typings";
import { awsService } from "./aws";

const main = () => {
  const port = 3001;
  const wss = new WebSocketServer({
    port,
    host: "0.0.0.0",
  });

  const terminalManager = new TerminalManager();
  let idleTimeout: NodeJS.Timeout | null = null;

  const terminateProcess = () => {
    console.log("Idle container exiting it");
    if (wss.clients.size > 0) {
      console.log("users are doing nothing... pause the container here");
      // Todo: 'pause" the container here
      wss.clients.forEach((ws) => {
        sendResponse(
          {
            serverEvent: OutgoingMessageType.PLAYGROUND_PAUSED,
            data: {},
          },
          ws
        );
      });
    }

    process.exit(0);
  };

  const resetIdleTimeout = () => {
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(terminateProcess, idleInterval);
  };

  const idleInterval = Number(env.IDLE_INTERVAL) * 1000 * 60;

  fsService.watchForDepsChange((deps) => {
    wss.clients.forEach((c) => {
      sendResponse(
        {
          serverEvent: OutgoingMessageType.INSTALL_DEPS,
          data: Array.from(deps),
        },
        c
      );
    });
  });

  fsService.watchWorkDir((event, path, shouldFetch) => {
    wss.clients.forEach((ws) => {
      sendResponse(
        {
          serverEvent: OutgoingMessageType.REFETCH_DIR,
          // data: finalPath === env.WORK_DIR ? "" : finalPath,
          data: {
            event,
            path,
            shouldFetch,
          },
        },
        ws
      );
    });
  });

  resetIdleTimeout();

  watchPorts([42069], () => {
    wss.clients.forEach((ws) => {
      sendResponse(
        {
          serverEvent: OutgoingMessageType.REFRESH_IFRAME,
          data: {},
        },
        ws
      );
    });
  });

  // TODO: Add authentication
  wss.on("connection", (ws: WebSocketWithKeepAlive) => {
    ws.isAlive = true;

    resetIdleTimeout();

    ws.on("message", async (data, isBinary) => {
      if (isBinary) return;
      resetIdleTimeout();
      const raw = data.toString();
      const { success, data: json } = parseJSON(raw);
      const { success: zodSuccess, data: message } = parseMessage(json);

      if (!success || !zodSuccess) {
        console.log("invalid ws message");
        console.log(raw);
        return;
      }

      switch (message?.event) {
        case IncomingMessage.SAVE_CHANGES:
          console.log("save changes req");
          await fsService.saveFile(
            message.data.filePath,
            message.data.newContent
          );
          sendResponse(
            { serverEvent: OutgoingMessageType.FILE_SAVED, data: "File saved" },
            ws
          );
          break;
        case IncomingMessage.GENERATE_TREE:
          const treeRoot = await fsService.generateFileTree(
            message.data?.path || env.WORK_DIR
          );
          if (!treeRoot) return;
          sendResponse(
            {
              nonce: message.nonce,
              data: treeRoot,
            },
            ws
          );
          break;

        case IncomingMessage.FILE_CONTENT:
          sendResponse(
            {
              nonce: message.nonce,
              data: await fsService.getFileContent(message.data.filePath),
            },
            ws
          );
          break;

        case IncomingMessage.TERMINAL_SESSION_START:
          const sessionId = message.data.prevSessionId || v4();

          await terminalManager.createPty(sessionId, (data) => {
            sendResponse(
              { serverEvent: OutgoingMessageType.TERMINAL_DATA, data },
              ws
            );
          });

          sendResponse({ nonce: message.nonce, data: { sessionId } }, ws);
          break;

        case IncomingMessage.TERMINAL_USER_CMD:
          terminalManager.write(message.data.sessionId, message.data.cmd);
          break;
        case IncomingMessage.RESIZE_TERMINAL:
          terminalManager.resize(message.data.sessionId, message.data);
          break;
        case IncomingMessage.GET_PROJECT_FILES:
          fsService.getAllProjectFiles().then(async (files) => {
            sendResponse(
              {
                nonce: message.nonce,
                data: files,
              },
              ws
            );
          });
          break;
        case IncomingMessage.GET_TYPINGS:
          const contents = await getDependenciesForPackage(
            message.data.package
          );

          sendResponse(
            {
              nonce: message.nonce,
              data: Array.from(contents),
            },
            ws
          );
          break;
        case IncomingMessage.GET_DEPS:
          sendResponse(
            {
              nonce: message.nonce,
              data: Array.from(await fsService.readPackageJsonDeps()),
            },
            ws
          );
      }
    });

    ws.on("close", () => {
      console.log("disconnected");
    });

    ws.on("pong", () => {
      ws.isAlive = true;
    });
  });

  wss.on("listening", () => {
    console.log("Container listening on port " + port);
  });

  const deadConnectionsInterval = setInterval(() => {
    // @ts-expect-error Using custom types
    wss.clients.forEach((ws: WebSocketWithKeepAlive) => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
    });
  }, 30 * 1000);

  // Saves everything to s3 every 1 min
  const s3Interval = setInterval(() => awsService.saveToS3(), 1 * 1000 * 60);

  wss.on("close", () => {
    clearInterval(deadConnectionsInterval);
    clearInterval(s3Interval);
  });
};

main();
