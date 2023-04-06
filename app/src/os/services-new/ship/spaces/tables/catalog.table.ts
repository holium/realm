import AbstractDataAccess, {
  DataAccessContructorParams,
} from '../../../abstract.db';
import { cleanNounColor } from '../../../../lib/color';

export interface App {
  id: string;
  title: string;
  href?: string;
  favicon?: string;
  type: string;
  config?: string;
  installStatus: string;
  info?: string;
  color?: string;
  image?: string;
  version?: string;
  website?: string;
  license?: string;
  host?: string;
  icon?: string;
}

export class AppCatalogDB extends AbstractDataAccess<App> {
  constructor(params: DataAccessContructorParams) {
    params.tableName = 'app_catalog';
    params.name = 'appCatalog';
    super(params);
    if (params.preload) {
      return;
    }
  }

  protected mapRow(row: any): App {
    return {
      id: row.id,
      title: row.title,
      href: row.href,
      favicon: row.favicon,
      type: row.type,
      config: row.config,
      installStatus: row.install_status,
      info: row.info,
      color: row.color,
      image: row.image,
      version: row.version,
      website: row.website,
      license: row.license,
      host: row.host,
      icon: row.icon,
      // updatedAt: row.updatedAt,
      // createdAt: row.createdAt,
    };
  }

  public getCatalog() {
    if (!this.db) throw new Error('No db connection');
    const select = this.db.prepare(
      `SELECT
        json_group_object(
          ac.id,
          json_object(
              'id', ac.id,
              'title', ac.title,
              'href', json(ac.href),
              'favicon', ac.favicon,
              'type', ac.type,
              'config', json(ac.config),
              'installStatus', ac.installStatus,
              'info', ac.info,
              'color', ac.color,
              'image', ac.image,
              'version', ac.version,
              'website', ac.website,
              'license', ac.license,
              'host', ac.host,
              'icon', ac.icon,
              'gridIndex', ag.idx
              )
          ) app
        FROM app_catalog ac
        LEFT JOIN app_grid ag ON ac.id = ag.appId
        WHERE ag.idx IS NOT NULL;`
    );
    const apps = select.all();
    if (!apps.length) return {};
    return JSON.parse(apps[0].app);
  }

  public insertAll(initial: any) {
    this._insertGrid(initial.grid);
    this._insertAppCatalog(initial.catalog);
    this._insertDocks(initial.docks);
    this._insertRecommendations(initial.recommendations);
    this._insertStalls(initial.stalls);
  }

  private _insertAppCatalog(catalog: { [key: string]: App }) {
    if (!this.db) throw new Error('No db connection');

    const insert = this.db.prepare(
      `REPLACE INTO app_catalog (
        id,
        title,
        href,
        favicon,
        type,
        config,
        installStatus,
        info,
        color,
        image,
        version,
        website,
        license,
        host,
        icon
      ) VALUES (
        @id,
        @title,
        @href,
        @favicon,
        @type,
        @config,
        @installStatus,
        @info,
        @color,
        @image,
        @version,
        @website,
        @license,
        @host,
        @icon
      )`
    );
    const insertMany = this.db.transaction((catalog) => {
      Object.values<any>(catalog).forEach((app) => {
        const { type } = app;
        let installStatus = app.installStatus || 'uninstalled';
        if (type === 'native') {
          installStatus = 'installed';
        }
        insert.run({
          ...app,
          favicon: app.favicon || null,
          info: app.info || null,
          image: app.image || null,
          version: app.version || null,
          website: app.website || null,
          license: app.license || null,
          host: app.host || null,
          icon: app.icon || null,
          installStatus,
          color: cleanNounColor(app.color),
          href: app.href ? JSON.stringify(app.href) : null,
          config: app.config ? JSON.stringify(app.config) : null,
        });
      });
    });
    insertMany(catalog);
  }

  private _insertGrid(grid: { [idx: string]: string }) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `REPLACE INTO app_grid (
        idx,
        appId
      ) VALUES (
        @idx,
        @appId

      )`
    );
    const insertMany = this.db.transaction((grid) => {
      Object.entries<any>(grid).forEach(([idx, appId]) => {
        insert.run({
          idx: parseInt(idx),
          appId,
        });
      });
    });
    insertMany(grid);
  }

  private _insertDocks(docks: { [key: string]: string[] }) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `REPLACE INTO docks (
        space,
        id,
        idx
      ) VALUES (
        @space,
        @id,
        @idx
      )`
    );
    const insertMany = this.db.transaction((docks) => {
      Object.entries<any>(docks).forEach(([space, ids]) => {
        ids.forEach((id: string, idx: string) => {
          insert.run({
            space,
            id,
            idx,
          });
        });
      });
    });
    insertMany(docks);
  }

  private _insertRecommendations(recommendations: string[]) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `REPLACE INTO recommendations (
        id
      ) VALUES (
        @id
      )`
    );
    const insertMany = this.db.transaction((recommendations) => {
      recommendations.forEach((id: string) => {
        insert.run({
          id,
        });
      });
    });
    insertMany(recommendations);
  }

  private _insertStalls(stalls: { [key: string]: string[] }) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `REPLACE INTO stalls (
        space,
        suite,
        recommended
      ) VALUES (
        @space,
        @suite,
        @recommended
      )`
    );
    const insertMany = this.db.transaction((stalls) => {
      Object.entries<any>(stalls).forEach(([space, stall]) => {
        insert.run({
          space,
          suite: JSON.stringify(stall.suite),
          recommended: JSON.stringify(stall.recommended),
        });
      });
    });
    insertMany(stalls);
  }
}

export const bazaarInitSql = `
create table if not exists app_catalog (
    id                TEXT PRIMARY KEY,
    title             TEXT NOT NULL,
    href              TEXT,
    favicon           TEXT,
    type              TEXT NOT NULL,
    config            TEXT,
    installStatus     TEXT NOT NULL,
    info              TEXT,
    color             TEXT,
    image             TEXT,
    version           TEXT,
    website           TEXT,
    license           TEXT,
    host              TEXT,
    icon              TEXT
);
create table if not exists app_grid (
    idx               INTEGER NOT NULL,
    appId             TEXT NOT NULL
);
create unique index if not exists grid_uindex on app_grid (idx, appId);


create table if not exists docks (
    space             TEXT NOT NULL,
    id                TEXT NOT NULL,
    idx               INTEGER NOT NULL,
    FOREIGN KEY (space) REFERENCES spaces (path),
    FOREIGN KEY (id) REFERENCES app_catalog (id)
);

create unique index if not exists docks_uindex on docks (space, id);


create table if not exists recommendations (
    id                TEXT NOT NULL
);
create unique index if not exists recommendations_uindex on recommendations (id);

create table if not exists stalls (
    space             TEXT NOT NULL,
    suite             TEXT NOT NULL,
    recommended       TEXT NOT NULL,
    FOREIGN KEY (space) REFERENCES spaces (path)
);
create unique index if not exists stalls_uindex on stalls (space);

`;
