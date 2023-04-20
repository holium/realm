import { fork, ChildProcess } from 'child_process';
import ipc from 'node-ipc';

export default abstract class AbstractNodeProcess {
  private process: ChildProcess | null = null;
  private ipcServer: ipc.IPC | null = null;
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  protected startProcess(scriptPath: string): void {
    if (this.process) {
      return;
    }

    this.process = fork(scriptPath, [], { stdio: 'inherit' });

    this.process.on('exit', () => {
      this.process = null;
    });

    this.setupIpcServer();
  }

  protected stopProcess(): void {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }

    this.cleanupIpcServer();
  }

  private setupIpcServer(): void {
    ipc.config.id = this.serviceName;
    ipc.config.retry = 1500;
    ipc.config.silent = true;

    this.ipcServer = new ipc.IPC();
    this.ipcServer.serve(() => {
      this.ipcServer.server.on('message', (data: any, socket: ipc.Socket) => {
        this.handleIpcMessage(data, socket);
      });
    });

    this.ipcServer.server.start();
  }

  private cleanupIpcServer(): void {
    if (this.ipcServer) {
      this.ipcServer.server.stop();
      this.ipcServer = null;
    }
  }

  protected abstract handleIpcMessage(data: any, socket: ipc.Socket): void;
}
