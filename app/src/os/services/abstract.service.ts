import {
  BrowserWindow,
  ipcMain,
  IpcMainInvokeEvent,
  ipcRenderer,
  IpcRendererEvent,
} from 'electron';

import { MethodProxies, UpdatePayload } from './abstract.types';
// import log from 'electron-log';

export interface ServiceOptions {
  preload: boolean;
  verbose?: boolean;
}

const methodFilter = (method: any, serviceName: any) =>
  method !== 'constructor' &&
  !method.startsWith('_') &&
  !method.startsWith('onUpdate') &&
  typeof (serviceName as any)[method] === 'function';

abstract class AbstractService<U = unknown> {
  serviceName: string;

  constructor(
    serviceName: string,
    options: ServiceOptions = { preload: false, verbose: false }
  ) {
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
  public sendUpdate(data: U): void {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => {
      window.webContents.send(`${this.serviceName}.onUpdate`, data);
    });
  }

  /**
   * ------------------------------
   * onUpdate
   * ------------------------------
   * By default, this method does nothing. It is registered
   * as a callback for the onUpdate IPC event.
   *
   * @param _callback the callback to register
   * @returns void
   * @see _registerIpcRendererCallbacks
   *
   */
  public onUpdate(_callback: UpdatePayload<U>): void {}

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
    [event: string]: (callback: UpdatePayload<U>) => void;
  } {
    return {
      onUpdate: (callback: UpdatePayload<U>) => {
        ipcRenderer.on(
          `${this.serviceName}.onUpdate`,
          (_e: IpcRendererEvent, update: U) => {
            callback(update);
          }
        );
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
    ).filter((method) => methodFilter(method, this));

    methods.forEach((method) => {
      const ipcChannel = `${this.serviceName}.${method}`;
      // first remove any existing handlers
      ipcMain.removeHandler(ipcChannel);
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

  /**
   * ------------------------------
   * reset
   * ------------------------------
   * Removes all IPC handlers and IPC renderer listeners.
   * This method is called by the constructor.
   * @returns void
   * @private
   */
  removeHandlers() {
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this)
    ).filter((method) => methodFilter(method, this));
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
  static preload<T extends AbstractService>(service: T): MethodProxies<T> {
    const serviceName = service.serviceName;
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(service)
    ).filter((method) => methodFilter(method, service));

    const mappedMethods = methods.reduce((acc, method) => {
      acc[method as keyof T] = ((...args: any[]) => {
        return ipcRenderer.invoke(`${serviceName}.${method}`, ...args);
      }) as any;
      return acc;
    }, {} as Partial<MethodProxies<T>>);

    const callbacks = service._registerIpcRendererCallbacks();
    Object.keys(callbacks).forEach((event) => {
      mappedMethods[event as keyof T] = callbacks[event] as any;
    });

    return mappedMethods as MethodProxies<T>;
  }
}

export default AbstractService;
