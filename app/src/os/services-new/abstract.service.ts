import { EventEmitter } from 'events';
import { ipcMain, ipcRenderer, IpcMainInvokeEvent } from 'electron';

export interface ServiceOptions {
  preload: boolean;
}
abstract class AbstractService extends EventEmitter {
  serviceName: string;

  constructor(
    serviceName: string,
    options: ServiceOptions = { preload: false }
  ) {
    super();
    this.serviceName = serviceName;
    if (!options.preload) {
      this.registerIpcHandlers();
    }
  }

  private registerIpcHandlers(): void {
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this)
    ).filter(
      (method) =>
        method !== 'constructor' && typeof (this as any)[method] === 'function'
    );

    methods.forEach((method) => {
      const ipcChannel = `${this.serviceName}.${method}`;

      ipcMain.handle(
        ipcChannel,
        async (_event: IpcMainInvokeEvent, ...args: any[]) => {
          try {
            return await (this as any)[method](...args);
          } catch (error) {
            console.error(`Error in ${ipcChannel}:`, error);
            throw error;
          }
        }
      );
    });
  }

  static preload(
    service: AbstractService
  ): Record<string, (...args: any[]) => Promise<any>> {
    const serviceName = service.serviceName;
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(service)
    ).filter(
      (method) =>
        method !== 'constructor' &&
        !method.startsWith('_') &&
        typeof (service as any)[method] === 'function'
    );

    const mappedMethods: Record<string, (...args: any[]) => Promise<any>> = {};
    methods.forEach((method) => {
      mappedMethods[method] = async (...args: any[]) => {
        return await ipcRenderer.invoke(`${serviceName}.${method}`, ...args);
      };
    });

    return mappedMethods;
  }
}

export default AbstractService;
