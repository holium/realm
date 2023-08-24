import {
  BrowserWindow,
  ipcMain,
  IpcMainInvokeEvent,
  ipcRenderer,
  IpcRendererEvent,
} from 'electron';

import { MethodProxies, UpdatePayload } from '../../abstract.types';
import {
  BedrockRow,
  BedrockUpdateType,
  deleteRowUpdate,
} from './bedrock.types';

export const BUILTIN_TABLES: { [k: string]: string } = {
  vote: 'votes',
  comment: 'comments',
  rating: 'ratings',
  relay: 'relays',
  message: 'message',
  chat: 'chat',
};

abstract class AbstractDbManager {
  protected readonly name: string;

  constructor(params: { preload: boolean; name?: string; verbose?: boolean }) {
    if (!params.name) throw new Error('DbManager must have a name');
    this.name = params.name;
    if (params.preload) return;
    if (!params.preload) {
      this._registerIpcHandlers();
    }
  }

  protected makeTableName(type: string, v: number) {
    const tableName = `bedrock_${type}_${v}`;
    if (BUILTIN_TABLES[type]) {
      return `${BUILTIN_TABLES[type]}_${v}`;
    }
    return tableName;
  }

  // return true if table is ready to be written to
  abstract createTableIfNotExists(row: BedrockRow): boolean;

  // return true if the rows were inserted
  abstract insertRows(rows: BedrockRow[]): boolean;

  // return true if the rows were updated
  abstract updateRows(rows: BedrockRow[]): boolean;

  // return true if the rows were deleted
  abstract deleteRows(dels: deleteRowUpdate[]): boolean;

  abstract selectByPath(type: string, v: number, path: string): BedrockRow[];

  abstract selectById(type: string, v: number, id: string): BedrockRow[];

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
      window.webContents.send(`${this.name}.onUpdate`, data);
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
  public onUpdate(_callback: UpdatePayload<BedrockUpdateType>): void {}

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
    [event: string]: (callback: UpdatePayload<BedrockUpdateType>) => void;
  } {
    return {
      onUpdate: (callback: UpdatePayload<BedrockUpdateType>) => {
        ipcRenderer.on(
          `${this.name}.onUpdate`,
          (_e: IpcRendererEvent, update: BedrockUpdateType) => callback(update)
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
    ).filter(
      (method) =>
        method !== 'constructor' &&
        !method.startsWith('onUpdate') &&
        typeof (this as any)[method] === 'function'
    );

    methods.forEach((method) => {
      const ipcChannel = `${this.name}.${method}`;
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
  reset(): void {
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this)
    ).filter(
      (method) =>
        method !== 'constructor' && typeof (this as any)[method] === 'function'
    );
    methods.forEach((method) => {
      const ipcChannel = `${this.name}.${method}`;
      ipcMain.removeHandler(ipcChannel);
    });
    // remove ipcRenderer listeners
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => {
      window.webContents.removeAllListeners(`${this.name}.onUpdate`);
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

  static preload<T extends AbstractDbManager>(service: T): MethodProxies<T> {
    const dbName = service.name;
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(service)
    ).filter(
      (method) =>
        method !== 'constructor' &&
        !method.startsWith('_') &&
        !method.startsWith('onUpdate') &&
        typeof (service as any)[method] === 'function'
    );

    const mappedMethods = methods.reduce((acc, method) => {
      acc[method as keyof T] = ((...args: any[]) => {
        return ipcRenderer.invoke(`${dbName}.${method}`, ...args);
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

export default AbstractDbManager;
