import "dotenv/config";
import { WebSocketServer } from "ws";
import { parseJSON } from "./utils";
import { parseMessage, sendResponse } from "./ws";
import { IncomingMessage, OutgoingMessageType } from "./types";
import { fsService } from "./fs";
import { TerminalManager } from "./sessions";
import { v4 } from "uuid";
import { env } from "./env";
import path from "path";

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
      return;
    }

    process.exit(0);
  };

  const resetIdleTimeout = () => {
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(terminateProcess, idleInterval);
  };

  // 5 Mins
  const idleInterval = 5 * 60 * 1000;

  // fsService.watchForDepsChange(
  //   path.join(env.WORK_DIR, env.DEPS_FILE),
  //   (deps) => {
  //     wss.clients.forEach((c) => {
  //       sendResponse(
  //         {
  //           serverEvent: OutgoingMessageType.INSTALL_DEPS,
  //           data: deps,
  //         },
  //         c
  //       );
  //     });
  //   }
  // );

  fsService.watchWorkDir((event, path) => {
    wss.clients.forEach((ws) => {
      sendResponse(
        {
          serverEvent: OutgoingMessageType.REFETCH_DIR,
          // data: finalPath === env.WORK_DIR ? "" : finalPath,
          data: {
            event,
            path,
          },
        },
        ws
      );
    });
  });

  resetIdleTimeout();

  // TODO: Add authentication
  wss.on("connection", (ws) => {
    const wsId = v4();
    resetIdleTimeout();

    console.log("new connection");

    // readAndBundleTypes().then((types) => {
    //   sendResponse(
    //     {
    //       serverEvent: OutgoingMessageType.INSTALL_DEPS,
    //       data: types,
    //     },
    //     ws
    //   );
    // });
    ws.on("message", async (data, isBinary) => {
      if (isBinary) return;
      resetIdleTimeout();
      const raw = data.toString();
      const { success, data: json } = parseJSON(raw);
      const { success: zodSuccess, data: message } = parseMessage(json);

      if (!success || !zodSuccess) {
        console.log("invalid ws message");
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
          sendResponse(
            {
              nonce: message.nonce,
              data: await fsService.generateFileTree(
                message?.data?.path || env.WORK_DIR
              ),
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
          await terminalManager.createPty(wsId, (data) => {
            sendResponse(
              { serverEvent: OutgoingMessageType.TERMINAL_DATA, data },
              ws
            );
          });
          sendResponse({ nonce: message.nonce, data: "OK" }, ws);
          break;

        case IncomingMessage.TERMINAL_USER_CMD:
          terminalManager.write(wsId, message.data.cmd);
          break;
        case IncomingMessage.RESIZE_TERMINAL:
          terminalManager.resize(wsId, message.data);
          break;
        case IncomingMessage.GET_PROJECT_FILES:
          fsService.getAllProjectFiles(env.WORK_DIR).then(async (it) => {
            if (!it) return;

            const map: Record<string, string> = {};

            for await (const file of it) {
              map[file.name] = file.contents || "";
            }

            sendResponse(
              {
                nonce: message.nonce,
                data: map,
              },
              ws
            );
          });
      }
    });
  });

  wss.on("listening", () => {
    console.log("Container listening on port " + port);
  });
};

main();
