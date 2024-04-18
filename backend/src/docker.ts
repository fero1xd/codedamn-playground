import Dockerode, { Container } from 'dockerode';

const docker = new Dockerode({ socketPath: '/var/run/docker.sock' });

export const createPlayground = async () => {
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
};
