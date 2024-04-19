import Dockerode from 'dockerode';
import { PassThrough } from 'stream';
import { WebSocket } from 'ws';

const docker = new Dockerode({ socketPath: '/var/run/docker.sock' });

export const createPlayground = async (w: WebSocket) => {
  const container = await docker.getContainer(
    '0508664e6cf332d3131386e4d1ddb1f8ab18a34a1d42496994e039f5423a4cec'
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
    User: 'bun',
    WorkingDir: '/home/bun',
    Env: ['TERM=xterm-256color'],
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
