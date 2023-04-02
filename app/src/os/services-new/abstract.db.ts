import { Database, Statement } from 'better-sqlite3';
import { BrowserWindow } from 'electron';

abstract class AbstractDataAccess<T> {
  protected readonly db: Database;
  protected readonly tableName: string;

  constructor(db: Database, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  protected abstract mapRow(row: any): T;

  protected prepare(query: string): Statement {
    return this.db.prepare(query);
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
}

export default AbstractDataAccess;
