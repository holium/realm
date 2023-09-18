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

export enum BUILTIN_TYPES {
  VOTE = '/vote/0v3.hirga.bspbd.edlma.dfk59.gtu38',
  RATING = '/rating/0v1.v2o4q.pouki.srj9s.5482s.r9m5k',
  COMMENT = '/comment/0v2.i12tg.bem6d.26vn3.710ac.ff5ad',
  REACT = '/react/0v5.ekos4.ojb47.ltstl.t0av6.2irf8',
  TAG = '/tag/0v3.1n5f4.fbcbp.9al74.3kvpq.r78fh',
  LINK = '/link/0v3.tg68o.rji01.m25h2.hs6fo.0lqlg',
  RELAY = '/relay/0v3.p12q0.0qv7v.29ogb.7lb9q.45hhv',
  CREDS = '/creds/0v1.dm2bu.v3m6c.jug6d.32qb0.3h103',
}

abstract class AbstractDbManager {
  protected readonly name: string;
  public abstract readonly open: boolean; // set this when the database is accessible

  constructor(params: { preload: boolean; name?: string; verbose?: boolean }) {
    if (!params.name) throw new Error('DbManager must have a name');
    this.name = params.name;
    if (params.preload) return;
    if (!params.preload) {
      this._registerIpcHandlers();
    }
  }

  protected makeTableName(type: string) {
    return `bedrock_${type.replace(/^\//, '').replaceAll(/[./-]/g, '_')}`;
  }

  // return true if table is ready to be written to
  abstract createTableIfNotExists(row: BedrockRow): boolean;

  // return true if the rows were inserted
  abstract insertRows(rows: BedrockRow[]): boolean;

  // return true if the rows were updated
  abstract updateRows(rows: BedrockRow[]): boolean;

  // return true if the rows were deleted
  abstract deleteRows(dels: deleteRowUpdate[]): boolean;

  abstract selectType(type: string): BedrockRow[];

  abstract selectByPath(type: string, path: string): BedrockRow[];

  abstract selectById(type: string, id: string): BedrockRow[];

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
