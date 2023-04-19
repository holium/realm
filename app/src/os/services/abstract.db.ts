import Database, { Statement } from 'better-sqlite3-multiple-ciphers';
import {
  BrowserWindow,
  ipcMain,
  IpcMainInvokeEvent,
  ipcRenderer,
  IpcRendererEvent,
} from 'electron';
import { MethodProxies, UpdatePayload } from './abstract.types';

export interface DataAccessContructorParams {
  preload: boolean;
  name?: string;
  db?: Database;
  tableName?: string;
}

abstract class AbstractDataAccess<T, U = unknown> {
  protected readonly db?: Database;
  protected readonly tableName?: string;
  protected readonly name: string;
  protected readonly pKey: string = 'id';

  constructor(params: {
    preload: boolean;
    name?: string;
    db?: Database;
    tableName?: string;
    pKey?: string;
  }) {
    if (!params.name) throw new Error('DataAccess must have a name');
    this.name = params.name;
    if (params.preload) return;
    this.db = params.db;
    this.tableName = params.tableName;
    this.pKey = params.pKey || this.pKey;
    if (!params.preload) {
      this._registerIpcHandlers();
    }
  }

  protected abstract mapRow(row: any): T;

  protected prepare(query: string): Statement<any> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db?.prepare(query);
  }

  public find(where?: string): T[] {
    const query = `SELECT * FROM ${this.tableName}${
      where ? ` WHERE ${where}` : ''
    }`;
    const stmt = this.prepare(query);

    const rows = stmt.all();
    return rows.map((row) => this.mapRow(row));
  }

  public findFirst(where?: string): T | null {
    const query = `SELECT * FROM ${this.tableName}${
      where ? ` WHERE ${where}` : ''
    } LIMIT 1`;
    const stmt = this.prepare(query);

    const row = stmt.get();
    return row ? this.mapRow(row) : null;
  }

  public findOne(pKey: number | string): T | null {
    const query = `SELECT * FROM ${this.tableName} WHERE ${this.pKey} = ?`;
    const stmt = this.prepare(query);

    const row = stmt.get(pKey);
    return row ? this.mapRow(row) : null;
  }

  public create(values: Partial<T>): T {
    const columns = Object.keys(values).join(', ');
    const placeholders = Object.keys(values)
      .map(() => '?')
      .join(', ');
    const query = `REPLACE INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    const stmt = this.prepare(query);

    const result = stmt.run(Object.values(values));
    const id = result.lastInsertRowid;
    if (!id) throw new Error('Failed to create new record');
    const created = this.findOne(id as number);
    if (!created) throw new Error('Failed to create new record');
    return created;
  }

  public update(pKey: number | string, values: Partial<T>): T {
    const setClause = Object.keys(values)
      .map((key) => `${key} = ?`)
      .join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${this.pKey} = ?`;
    const stmt = this.prepare(query);

    const result = stmt.run([...Object.values(values), pKey]);
    if (result.changes !== 1) throw new Error('Failed to update record');
    const updated = this.findOne(pKey);
    if (!updated) throw new Error('Failed to update record');
    return updated;
  }

  public delete(pKey: number | string): void {
    const query = `DELETE FROM ${this.tableName} WHERE ${this.pKey} = ?`;
    const stmt = this.prepare(query);
    stmt.run(pKey);
  }

  public raw(query: string, params?: any[]): any[] {
    const stmt = this.prepare(query);
    return stmt.all(params);
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
          `${this.name}.onUpdate`,
          (_e: IpcRendererEvent, update: U) => callback(update)
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
      ipcMain.removeAllListeners(ipcChannel);
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

  static preload<T extends AbstractDataAccess<any>>(
    service: T
  ): MethodProxies<T> {
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

export default AbstractDataAccess;
