import { WebSocketServer } from 'ws';
import { checkPlaygroundStatus } from './docker';
import { createServer } from 'http';

export function createWSS() {
  const port = 3001;
  const server = createServer();

  const wss = new WebSocketServer({
    noServer: true,
  });

  wss.on('connection', () => {
    console.log('got connection');
  });

  server.on('upgrade', (req, sock, head) => {
    const assertContainerRunning = async () => {
      if (!req.url) {
        return false;
      }

      const { pathname } = new URL(req.url, `http://${req.headers.host}`);

      if (!pathname.startsWith('/attach/')) {
        return false;
      }

      const remaining = pathname.slice('/attach/'.length);
      if (!remaining) {
        return false;
      }

      if (remaining.includes('?') || remaining.includes('/')) {
        return false;
      }

      const containerId = remaining.trim();
      const exists = await checkPlaygroundStatus(containerId, 'running');

      if (!exists) {
        sock.write(
          'HTTP/1.1 400 No playground found with this id, try booting it up first\r\n\r\n'
        );
        sock.destroy();
        return true;
      }

      wss.handleUpgrade(req, sock, head, function done(ws) {
        wss.emit('connection', ws);
      });

      return true;
    };

    assertContainerRunning().then((s) => {
      if (!s) {
        sock.write('HTTP/1.1 400 Bad request\r\n\r\n');
        sock.destroy();
        return;
      }
    });
  });

  server.listen(port, () => {
    console.log(`wss server listening on port ${port}`);
  });
}
