import { type IPty, spawn } from "node-pty";
import { fsService } from "./fs";
import { env } from "./env";
import isDocker from "is-docker";

export class TerminalManager {
  private sessions: { [id: string]: IPty } = {};

  constructor() {
    this.sessions = {};
  }

  async createPty(id: string, onData: (data: string) => void) {
    await fsService.createDirIfNotExists(env.WORK_DIR);

    this.sessions[id]?.kill();

    const terminal = isDocker() ? "/bin/bash" : "/bin/zsh";
    const args = isDocker() ? [] : ["--login"];

    const term = spawn(terminal, args, {
      cols: 100,
      name: "xterm",
      cwd: env.WORK_DIR,
      env: {},
    });

    //    PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '

    term.onData(onData);

    this.sessions[id] = term;

    term.onExit(() => {
      console.log("on exit");
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
    this.sessions[terminalId]?.kill();
    delete this.sessions[terminalId];
  }
}
