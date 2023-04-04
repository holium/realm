import { EventEmitter } from 'events';
import {
  ipcMain,
  ipcRenderer,
  IpcMainInvokeEvent,
  BrowserWindow,
} from 'electron';
import log from 'electron-log';

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
    if (options?.preload) {
      return;
    }
    if (!options.preload) {
      this._registerIpcHandlers();
    }
  }

  /**
   * ------------------------------
   * sendUpdate
   * ------------------------------
   * Sends an IPC event to the renderer process.
   *
   * @param data the data to send
   * @returns void
   * @protected
   */
  protected sendUpdate(data: any): void {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => {
      window.webContents.send(`${this.serviceName}.onUpdate`, data);
    });
  }

  /**
   * ------------------------------
   * _registerIpcRendererCallbacks
   * ------------------------------
   * Override this method to register callbacks for IPC events.
   * By default, this method returns an onUpdate callback that sends
   * an IPC event to the renderer process.
   *
   * @returns a map of event names to callback functions
   * @protected
   */
  protected _registerIpcRendererCallbacks(): {
    [event: string]: (...args: any[]) => void;
  } {
    return {
      onUpdate: (callback: (...args: any[]) => void) => {
        ipcRenderer.on(`${this.serviceName}.onUpdate`, callback);
      },
    };
  }

  /**
   * ------------------------------
   * _registerIpcHandlers
   * ------------------------------
   * Registers IPC handlers for all methods on the service.
   * This method is called by the constructor.
   * @returns void
   * @private
   */
  private _registerIpcHandlers(): void {
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

  reset() {
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this)
    ).filter(
      (method) =>
        method !== 'constructor' && typeof (this as any)[method] === 'function'
    );
    methods.forEach((method) => {
      const ipcChannel = `${this.serviceName}.${method}`;

      ipcMain.removeHandler(ipcChannel);
    });
  }
  /**
   * ------------------------------
   * preload
   * ------------------------------
   * Generates a preload object for the renderer process.
   *
   * @param service
   * @returns a map of method names to functions
   */
  static preload(
    service: AbstractService
  ): Record<string, (...args: any[]) => Promise<any> | void> {
    const serviceName = service.serviceName;
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(service)
    ).filter(
      (method) =>
        method !== 'constructor' &&
        !method.startsWith('_') &&
        typeof (service as any)[method] === 'function'
    );

    const mappedMethods: Record<
      string,
      (...args: any[]) => Promise<any> | void
    > = {};
    methods.forEach((method) => {
      mappedMethods[method] = async (...args: any[]) => {
        return await ipcRenderer.invoke(`${serviceName}.${method}`, ...args);
      };
    });

    const callbacks = service._registerIpcRendererCallbacks();
    Object.keys(callbacks).forEach((event) => {
      mappedMethods[event] = callbacks[event];
    });
    return mappedMethods;
  }
}

export default AbstractService;
