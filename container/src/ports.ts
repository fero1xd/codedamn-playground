import { Worker } from "worker_threads";

/**
 * @param ports Ports to watch
 * @param cb Called when one of the given ports is being used
 */
export function watchPorts(
  ports: number[],
  cb: (port: number, inUse: boolean) => void
) {
  ports.forEach((port) => {
    const w = new Worker(`./dist/workers/ports.mjs`, {
      workerData: {
        port,
      },
    });

    w.on("message", (data: { status: number }) => {
      cb(port, data.status === 200);
    });
  });
}
