import Dockerode from 'dockerode';
import { PassThrough } from 'stream';
import { WebSocket } from 'ws';

const docker = new Dockerode({ socketPath: '/var/run/docker.sock' });

export const startPlaygroundBash = async (w: WebSocket) => {
  const container = await docker.getContainer(
    'de4c0b873a6a68b0c7f40f27b6213a13313a09eb4a560767234ecbf2a41e6dc6'
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

export const attachPlayground = async () => {
  // const container = await docker.getContainer(
  //   'de4c0b873a6a68b0c7f40f27b6213a13313a09eb4a560767234ecbf2a41e6dc6'
  // );
  // container.attach(
  //   {
  //     stdout: true,
  //     stderr: true,
  //     stream: true,
  //   },
  //   function (err, stream) {
  //     if (err) throw err;
  //     if (!stream) {
  //       return console.log('????');
  //     }
  //     console.log('attached');
  //     container.modem.demuxStream(stream, process.stdout, process.stderr);
  //   }
  // );
};

export const createPlaygroundContainer = async (id: string) => {
  try {
    console.log(`Creating playground container with id: ${id}`);
    const container = await docker.createContainer({
      Image: 'playgrounds',
      ExposedPorts: {
        '3000/tcp': {},
      },
      HostConfig: {
        PortBindings: {
          '3000/tcp': [
            {
              HostPort: '3000',
            },
          ],
        },
      },
      Labels: {
        playgroundId: id,
      },
    });

    console.log(`Created playground container with id: ${id}`);

    return container.id;
  } catch (e) {
    console.log('error while creating container');
    console.log(e);
    return false;
  }
};

export const startPlayground = async (id: string) => {
  try {
    const containers = await docker.listContainers({
      filters: {
        status: ['created', 'exited'],
        label: [`playgroundId=${id}`],
      },
    });

    if (!containers.length) {
      console.log('no playground created');
      return false;
    }
    if (containers.length > 1) {
      console.log('more than 1 container for a playground!!!! shuldnt be here');
      // TODO: handle this
      return false;
    }

    const c = containers[0];
    const container = await docker.getContainer(c.Id);

    console.log(`starting playground container with id: ${id}`);
    await container.start();
    console.log(`started playground container with id: ${id}`);

    return true;
  } catch (e) {
    console.log('error while starting container');
    console.log(e);
    return false;
  }
};
