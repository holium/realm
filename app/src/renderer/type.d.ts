declare module 'urbit-ob';
declare module 'whatwg-fetch';
declare module 'color.js';

declare module 'better-sqlite3-multiple-ciphers' {
  // You can declare the types for the 'better-sqlite3-multiple-ciphers' module here.
  // For example, you can declare the 'Database' class and its methods.
  interface Statement<BindParameters extends any[]> {
    database: Database;
    source: string;
    reader: boolean;
    readonly: boolean;
    busy: boolean;

    run(...params: BindParameters): Database.RunResult;
    get(...params: BindParameters): any;
    all(...params: BindParameters): any[];
    iterate(...params: BindParameters): IterableIterator<any>;
    pluck(toggleState?: boolean): this;
    expand(toggleState?: boolean): this;
    raw(toggleState?: boolean): this;
    bind(...params: BindParameters): this;
    columns(): ColumnDefinition[];
    safeIntegers(toggleState?: boolean): this;
  }

  interface ColumnDefinition {
    name: string;
    column: string | null;
    table: string | null;
    database: string | null;
    type: string | null;
  }

  interface Transaction<F extends VariableArgFunction> {
    (...params: ArgumentTypes<F>): ReturnType<F>;
    default(...params: ArgumentTypes<F>): ReturnType<F>;
    deferred(...params: ArgumentTypes<F>): ReturnType<F>;
    immediate(...params: ArgumentTypes<F>): ReturnType<F>;
    exclusive(...params: ArgumentTypes<F>): ReturnType<F>;
  }

  interface VirtualTableOptions {
    rows: () => Generator;
    columns: string[];
    parameters?: string[] | undefined;
    safeIntegers?: boolean | undefined;
    directOnly?: boolean | undefined;
  }

  export default class Database {
    memory: boolean;
    readonly: boolean;
    name: string;
    open: boolean;
    inTransaction: boolean;
    constructor(filename: string, options?: Database.Options): Database;

    prepare<BindParameters extends any[] | {} = any[]>(
      source: string
    ): BindParameters extends any[]
      ? Statement<BindParameters>
      : Statement<[BindParameters]>;
    transaction<F extends VariableArgFunction>(fn: F): Transaction<F>;
    exec(source: string): this;
    pragma(source: string, options?: Database.PragmaOptions): any;
    function(name: string, cb: (...params: any[]) => any): this;
    function(
      name: string,
      options: Database.RegistrationOptions,
      cb: (...params: any[]) => any
    ): this;
    aggregate(name: string, options: Database.AggregateOptions): this;
    loadExtension(path: string): this;
    close(): this;
    defaultSafeIntegers(toggleState?: boolean): this;
    backup(
      destinationFile: string,
      options?: Database.BackupOptions
    ): Promise<Database.BackupMetadata>;
    table(name: string, options: VirtualTableOptions): this;
    unsafeMode(unsafe?: boolean): this;
    serialize(options?: Database.SerializeOptions): Buffer;
  }

  interface DatabaseConstructor {
    new (filename: string | Buffer, options?: Database.Options): Database;
    (filename: string, options?: Database.Options): Database;
    prototype: Database;

    SqliteError: typeof SqliteError;
  }
}
