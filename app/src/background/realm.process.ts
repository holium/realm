import AbstractNodeProcess from './abstract.process';

export default class RealmProcess extends AbstractNodeProcess {
  constructor() {
    super('realmProcess');
  }

  start(): void {
    this.startProcess('src/background/process.js');
  }

  stop(): void {
    this.stopProcess();
  }

  protected handleIpcMessage(data: any, socket: ipc.Socket): void {
    // Handle IPC messages from the utility process
  }
}
