import { IPty, spawn } from 'node-pty';
import { createDirIfNotExists } from './fs';
import { env } from './env';

export class TerminalManager {
  private sessions: { [id: string]: IPty } = {};

  constructor() {
    this.sessions = {};
  }

  async createPty(id: string, onData: (data: string) => void) {
    await createDirIfNotExists(env.WORK_DIR);

    const term = spawn('bash', [], {
      cols: 100,
      name: 'xterm',
      cwd: env.WORK_DIR,
    });

    term.onData(onData);

    this.sessions[id] = term;

    term.onExit(() => {
      delete this.sessions[term.pid];
    });

    return term;
  }

  write(terminalId: string, data: string) {
    this.sessions[terminalId]?.write(data);
  }

  resize(terminalId: string, { cols, rows }: { cols: number; rows: number }) {
    this.sessions[terminalId]?.resize(cols, rows);
  }

  clear(terminalId: string) {
    this.sessions[terminalId].kill();
    delete this.sessions[terminalId];
  }
}
