import Dockerode from 'dockerode';
import { PassThrough } from 'stream';
import { WebSocket } from 'ws';

const docker = new Dockerode({ socketPath: '/var/run/docker.sock' });

export const createPlayground = async (w: WebSocket) => {
  // TODO: do this later
  // if (!container) {
  //   const c = await docker.getContainer(
  //     'b30349e4e26c053ea13cd94d9543269f60245a28e7e0f1998768699b5fae6b75'
  //   );
  //   container = c;
  //   console.log(c.id);
  // }
  // container.attach(
  //   { stream: true, stdout: true, stderr: true, stdin: true, hijack: true },
  //   function (err, stream) {
  //     if (!stream) {
  //       console.log('no stream');
  //       return;
  //     }
  //     if (err) {
  //       console.log(err);
  //       return;
  //     }
  //     w.onmessage = (e) => {
  //       stream.write(e.data.toString());
  //     };
  //     setTimeout(() => {
  //       stream.write('\n');
  //       stream.on('data', (d: Buffer) => {
  //         w.send(d);
  //       });
  //     }, 1000);
  //   }
  // );

  const container = await docker.getContainer(
    'cb782bed26b3617aca31dbf67bd90f43ebfa52078b568aaa53c586c01903ae52'
  );

  const inspect = await container.inspect();

  console.log('available exec sessions');
  console.log(inspect.ExecIDs);

  const exec = await container.exec({
    Cmd: ['bash'],
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
  });

  await exec.start(
    {
      stdin: true,
      hijack: true,
    },
    function (err, stream) {
      if (err) throw err;
      if (!stream) {
        return console.log('???');
      }

      console.log('**creating exec session**');

      w.onmessage = (e) => {
        stream.write(e.data.toString());
      };

      const fromContainerStdout = new PassThrough();
      const fromContainerStderr = new PassThrough();

      docker.modem.demuxStream(
        stream,
        fromContainerStdout,
        fromContainerStderr
      );

      fromContainerStdout.on('data', (d: Buffer) => {
        w.send(d);
      });
      fromContainerStderr.on('data', (d: Buffer) => {
        w.send(d);
      });

      stream.on('end', () => {
        console.log('**Session ended**');
      });
    }
  );
};
