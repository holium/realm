import { Database, Statement } from 'better-sqlite3';
import {
  BrowserWindow,
  ipcMain,
  IpcMainInvokeEvent,
  ipcRenderer,
} from 'electron';

export interface DataAccessContructorParams {
  preload: boolean;
  name?: string;
  db?: Database;
  tableName?: string;
}

abstract class AbstractDataAccess<T> {
  protected readonly db?: Database;
  protected readonly tableName?: string;
  protected readonly name: string;

  constructor(params: {
    preload: boolean;
    name?: string;
    db?: Database;
    tableName?: string;
  }) {
    if (!params.name) throw new Error('DataAccess must have a name');
    this.name = params.name;
    if (params.preload) return;
    this.db = params.db;
    this.tableName = params.tableName;
    if (!params.preload) {
      this._registerIpcHandlers();
    }
  }

  protected abstract mapRow(row: any): T;

  protected prepare(query: string): Statement {
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

  public findOne(id: number | string): T | null {
    const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const stmt = this.prepare(query);

    const row = stmt.get(id);
    return row ? this.mapRow(row) : null;
  }

  public create(values: Partial<T>): T {
    const columns = Object.keys(values).join(', ');
    const placeholders = Object.keys(values)
      .map(() => '?')
      .join(', ');
    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    const stmt = this.prepare(query);

    const result = stmt.run(Object.values(values));
    const id = result.lastInsertRowid;
    if (!id) throw new Error('Failed to create new record');
    const created = this.findOne(id as number);
    if (!created) throw new Error('Failed to create new record');
    return created;
  }

  public update(id: number | string, values: Partial<T>): T {
    const setClause = Object.keys(values)
      .map((key) => `${key} = ?`)
      .join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    const stmt = this.prepare(query);

    const result = stmt.run([...Object.values(values), id]);
    if (result.changes !== 1) throw new Error('Failed to update record');
    const updated = this.findOne(id);
    if (!updated) throw new Error('Failed to update record');
    return updated;
  }

  public delete(id: number | string): void {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const stmt = this.prepare(query);

    stmt.run(id);
  }

  public raw(query: string, params?: any[]): any[] {
    const stmt = this.prepare(query);
    return stmt.all(params);
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
        ipcRenderer.on(`${this.name}.onUpdate`, callback);
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
      const ipcChannel = `${this.name}.${method}`;
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

  reset() {
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
    service: AbstractDataAccess<any>
  ): Record<string, (...args: any[]) => Promise<any> | void> {
    const dbName = service.name;
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
        return await ipcRenderer.invoke(`${dbName}.${method}`, ...args);
      };
    });

    const callbacks = service._registerIpcRendererCallbacks();
    Object.keys(callbacks).forEach((event) => {
      mappedMethods[event] = callbacks[event];
    });
    return mappedMethods;
  }
}

export default AbstractDataAccess;
