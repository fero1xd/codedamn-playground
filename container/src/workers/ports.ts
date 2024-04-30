import { parentPort, workerData } from "worker_threads";
import portWatcher from "tcp-port-used";

const main = async (port: number) => {
  let wasInUse = false;

  console.log("watching port " + port);
  while (true) {
    const inUse = await portWatcher.check(port);
    if (inUse && !wasInUse) {
      wasInUse = true;

      parentPort?.postMessage({
        status: 200,
      });
    } else {
      if (wasInUse && !inUse) {
        parentPort?.postMessage({
          status: 404,
        });
      }

      if (!inUse) {
        wasInUse = false;
      }
    }

    await new Promise<void>((res) =>
      setTimeout(() => {
        res();
      }, 5000)
    );
  }
};

main(workerData.port as number);
