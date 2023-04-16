import { Database } from 'better-sqlite3';
import AbstractDataAccess from '../../../abstract.db';

export interface Transaction {
  space: string;
  patp: string;
  roles: string;
  alias: string;
  status: string;
  // createdAt: number;
  // updatedAt: number;
}

export class TransactionsDB extends AbstractDataAccess<Transaction> {
  constructor(preload: boolean, db?: Database) {
    super({
      preload: preload,
      db,
      name: 'transactionsDB',
      tableName: 'wallet_transactions',
    });
    if (preload) {
      return;
    }
  }

  protected mapRow(row: any): Transaction {
    return {
      space: row.space,
      patp: row.patp,
      roles: JSON.parse(row.roles),
      alias: row.alias,
      status: row.status,
      // updatedAt: row.updatedAt,
      // createdAt: row.createdAt,
    };
  }

  public insertAll(spacesMembers: { [key: string]: Transaction[] }) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `REPLACE INTO spaces_members (
        space,
        patp,
        roles,
        alias,
        status
      ) VALUES (
        @space,
        @patp,
        @roles,
        @alias,
        @status
      )`
    );
    const insertMany = this.db.transaction((spacesMembers) => {
      Object.entries<any>(spacesMembers).forEach(([space, memberList]) => {
        Object.entries<any>(memberList).forEach(([patp, member]) => {
          insert.run({
            space,
            patp: patp,
            roles: JSON.stringify(member.roles),
            alias: member.alias || '',
            status: member.status,
          });
        });
      });
    });
    insertMany(spacesMembers);
    this.sendUpdate({
      type: 'insert',
      payload: this.find(),
    });
  }

  public createTransaction(values: Partial<Transaction>): Transaction {
    if (values.roles) values.roles = JSON.stringify(values.roles);
    const columns = Object.keys(values).join(', ');
    const placeholders = Object.keys(values)
      .map(() => '?')
      .join(', ');
    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    const stmt = this.prepare(query);
    stmt.run(Object.values(values));
    if (!values.space || !values.patp)
      throw new Error('Failed to create new record');
    const created = this.getMember(values.space, values.patp);
    if (!created) throw new Error('Failed to create new record');
    return created;
  }

  public getTransaction(path: string, patp: string): Transaction | null {
    const query = `SELECT * FROM ${this.tableName} WHERE space = ? and patp = ?`;
    const stmt = this.prepare(query);
    const row = stmt.get(path, patp);
    return row ? this.mapRow(row) : null;
  }

  public updateTransaction(
    path: string,
    patp: string,
    values: Partial<Transaction>
  ): Transaction {
    if (values.roles) values.roles = JSON.stringify(values.roles);
    const setClause = Object.keys(values)
      .map((key) => `${key} = ?`)
      .join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE space = ? and patp = ?`;
    const stmt = this.prepare(query);
    stmt.run([...Object.values(values), path, patp]);
    const updated = this.getMember(path, patp);
    if (!updated) throw new Error('Failed to update record');
    return updated;
  }

  public create(values: Partial<Transaction>): Transaction {
    if (values.roles) values.roles = JSON.stringify(values.roles);
    const columns = Object.keys(values).join(', ');
    const placeholders = Object.keys(values)
      .map(() => '?')
      .join(', ');
    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    const stmt = this.prepare(query);

    stmt.run(Object.values(values));
    if (!values.space) throw new Error('Failed to create new record');
    const created = this.findOne(values.space);
    if (!created) throw new Error('Failed to create new record');
    return created;
  }

  public update(path: string, values: Partial<Transaction>): Transaction {
    const setClause = Object.keys(values)
      .map((key) => `${key} = ?`)
      .join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE path = ?`;
    const stmt = this.prepare(query);

    stmt.run([...Object.values(values), path]);
    const updated = this.findOne(path);
    if (!updated) throw new Error('Failed to update record');
    return updated;
  }

  public delete(path: string): void {
    const query = `DELETE FROM ${this.tableName} WHERE path = ?`;
    const stmt = this.prepare(query);

    const result = stmt.run(path);
    if (result.changes !== 1) throw new Error('Failed to delete record');
  }
}

export const walletTransactionsInitSql = `
create table if not exists wallet_transactions
(
    hash           text    not null,
    network        text    not null,
    type           text    not null,
    initiated_at   integer not null,
    completed_at   integer,
    our_address    text    not null,
    their_patp     text,
    their_address  text    not null,
    status         text    not null,
    failure-reason text,
    notes          text,
);
create unique index if not exists hash_network_uindex
    on  (hash, network);
`;

export const walletTransactionsDBPreload = TransactionsDB.preload(
  new TransactionsDB(true)
);
