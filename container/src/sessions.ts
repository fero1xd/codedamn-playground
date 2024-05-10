import { IDisposable, type IPty, spawn } from "node-pty";
import { fsService } from "./fs";
import { env } from "./env";
import isDocker from "is-docker";

export class TerminalManager {
  private sessions: {
    [id: string]: { term: IPty; removeListener: IDisposable };
  } = {};
  private _env: Record<string, string>;

  constructor() {
    this.sessions = {};
    this._env = this.filterEnv();
  }

  async createPty(id: string, onData: (data: string) => void) {
    await fsService.createDirIfNotExists(env.WORK_DIR);

    const terminal = isDocker() ? "/bin/bash" : "/bin/zsh";
    const args = isDocker() ? [] : ["--login"];

    const prevSession = this.sessions[id];

    if (prevSession) {
      prevSession.removeListener.dispose();

      const removeListener = prevSession.term.onData(onData);
      this.sessions[id] = { ...prevSession, removeListener };

      console.log("terminal already exists with this iddd");
      return;
    }

    const term = spawn(terminal, args, {
      cols: 100,
      name: "xterm",
      cwd: env.WORK_DIR,
      env: this._env,
    });

    const removeListener = term.onData(onData);
    this.sessions[id] = { term, removeListener };

    term.onExit(() => {
      delete this.sessions[id];
    });

    return { term, hasSession: !!prevSession };
  }

  write(terminalId: string, data: string) {
    this.sessions[terminalId]?.term.write(data);
  }

  resize(terminalId: string, { cols, rows }: { cols: number; rows: number }) {
    this.sessions[terminalId]?.term.resize(cols, rows);
  }

  clear(terminalId: string) {
    this.sessions[terminalId]?.term.kill();
    this.sessions[terminalId]?.removeListener.dispose();
    delete this.sessions[terminalId];
  }

  filterEnv() {
    const rawEnv = process.env;
    const newEnv: Record<string, string> = {};
    const keys = Object.keys(env);

    for (const rawKey of Object.keys(rawEnv)) {
      if (keys.includes(rawKey)) {
        continue;
      }

      newEnv[rawKey] = rawEnv[rawKey] || "";
    }

    newEnv["TERM"] = "xterm-256color";
    console.log(newEnv);

    return newEnv;
  }
}
