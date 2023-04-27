import log from 'electron-log';

import { cleanNounColor } from '../../../../lib/color';
import AbstractDataAccess, {
  DataAccessContructorParams,
} from '../../../abstract.db';
import { spaceDockQuery, spaceStallQuery } from '../spaces.query';

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
  // gridIndex?: number;
  // isRecommended?: boolean;
}

export class AppCatalogDB extends AbstractDataAccess<App, any> {
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
      // gridIndex: row.gridIndex,
      // isRecommended?: row.isRecommended,
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
              'gridIndex', ag.idx,
              'isRecommended', CASE WHEN ar.id IS NULL THEN json('false') ELSE json('true') END
              )
          ) app
        FROM app_catalog ac
        LEFT JOIN app_grid ag ON ac.id = ag.appId
        LEFT JOIN app_recommendations ar ON ac.id = ar.id
        WHERE ag.idx IS NOT NULL AND ac.id != 'landscape';`
    );
    const apps: any[] = select.all();
    if (!apps.length) return {};
    return JSON.parse(apps[0].app);
  }

  public getApp(appId: string) {
    if (!this.db) throw new Error('No db connection');
    const select = this.db.prepare(
      `SELECT
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
            'gridIndex', ag.idx,
            'isRecommended', CASE WHEN ar.id IS NULL THEN json('false') ELSE json('true') END
            ) app
        FROM app_catalog ac
        LEFT JOIN app_grid ag ON ac.id = ag.appId
        LEFT JOIN app_recommendations ar ON ac.id = ar.id
        WHERE ac.id = ?;`
    );
    const apps: any[] = select.all(appId);
    if (!apps.length) return {};
    const app = JSON.parse(apps[0].app);
    app.isRecommended = app.isRecommended === 1;
    return app;
  }

  getDock(spacePath: string) {
    if (!this.db) throw new Error('No db connection');
    const select = this.db.prepare(
      `${spaceDockQuery}
      WHERE space = ?;`
    );
    const apps: any[] = select.all(spacePath);
    if (!apps.length) return {};
    return JSON.parse(apps[0].dock);
  }

  getStall(spacePath: string) {
    if (!this.db) throw new Error('No db connection');
    const select = this.db.prepare(
      `${spaceStallQuery}
      WHERE stalls.space = ?;`
    );
    const apps: any[] = select.all(spacePath);
    if (!apps.length) return {};
    return JSON.parse(apps[0].stall);
  }

  public updateInstallStatus(id: string, status: string) {
    if (!this.db) throw new Error('No db connection');
    const update = this.db.prepare(
      `UPDATE app_catalog SET installStatus = ? WHERE id = ?;`
    );
    update.run(status, id);
    const updated = this.getApp(id);
    if (!updated) log.error('catalog.table.ts:', 'App not found');
    return updated;
  }

  public updateSuite(
    payload: { id: string; index: number; path: string },
    type: 'add' | 'remove'
  ) {
    if (!this.db) throw new Error('No db connection');
    // get suite column
    const select = this.db.prepare(
      `SELECT json(suite) suite FROM spaces_stalls WHERE space = ?;`
    );
    const suites: any[] = select.all(payload.path);
    if (!suites.length) return {};
    const suite = JSON.parse(suites[0].suite);
    if (type === 'remove') {
      delete suite[payload.index];
    } else {
      suite[payload.index] = payload.id;
    }
    const update = this.db.prepare(
      `UPDATE spaces_stalls SET suite = ? WHERE space = ?;`
    );
    update.run(JSON.stringify(suite), payload.path);
    const updated = this.getStall(payload.path);
    if (!updated) log.error('catalog.table.ts:', 'Stall not found');
    return updated;
  }

  public updateStall(
    path: string,
    payload: {
      recommended: { [key: string]: number };
      suite: any;
    }
  ) {
    if (!this.db) throw new Error('No db connection');
    // update recommended
    const update = this.db.prepare(
      `UPDATE spaces_stalls SET suite = ?, recommended = ? WHERE space = ?;`
    );
    update.run(
      JSON.stringify(payload.suite),
      JSON.stringify(payload.recommended),
      path
    );
    const updated = this.getStall(path);
    if (!updated) log.error('catalog.table.ts:', 'Stall not found');
    return updated;
  }

  public updateCatalog(catalogUpdate: { [appId: string]: App }) {
    if (!this.db) throw new Error('No db connection');
    this._insertAppCatalog(catalogUpdate);
  }

  public updateApp(appId: string, app: App) {
    if (!this.db) throw new Error('No db connection');
    this._insertAppCatalog({ [appId]: app });
  }

  public updateGrid(grid: { [idx: string]: string }) {
    if (!this.db) throw new Error('No db connection');
    this._insertGrid(grid);
  }

  public updateRecommendations(
    update: { id: string; stalls: any },
    type: 'add' | 'remove'
  ) {
    if (!this.db) throw new Error('No db connection');
    if (type === 'add') {
      this._insertRecommendations([update.id]);
    } else {
      const deleteRecommendation = this.db.prepare(
        `DELETE FROM app_recommendations WHERE id = ?;`
      );
      deleteRecommendation.run(update.id);
    }
    this._insertStalls(update.stalls);
  }

  public updateDock(update: { path: string; dock: string[] }) {
    if (!this.db) throw new Error('No db connection');
    this.db
      .prepare(`REPLACE INTO app_docks (space, dock) VALUES (?, ?)`)
      .run(update.path, JSON.stringify(update.dock));
    return this.getDock(update.path);
  }

  // ------------------------------
  // ---------- INSERTS -----------
  // ------------------------------

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
    const insertMany = this.db.transaction((catalog: any) => {
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
    const insertMany = this.db.transaction((grid: any) => {
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
      `REPLACE INTO app_docks (
        space,
        dock
      ) VALUES (
        @space,
        @dock
      )`
    );
    const insertMany = this.db.transaction((docks: any) => {
      Object.entries<any>(docks).forEach(([space, dock]) => {
        insert.run({ space, dock: JSON.stringify(dock) });
      });
    });
    insertMany(docks);
  }

  private _insertRecommendations(recommendations: string[]) {
    if (!this.db) throw new Error('No db connection');
    const insert = this.db.prepare(
      `REPLACE INTO app_recommendations (
        id
      ) VALUES (
        @id
      )`
    );
    const insertMany = this.db.transaction((recommendations: any) => {
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
      `REPLACE INTO spaces_stalls (
        space,
        suite,
        recommended
      ) VALUES (
        @space,
        @suite,
        @recommended
      )`
    );
    const insertMany = this.db.transaction((stalls: any) => {
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

export const bazaarTablesInitSql = `
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


create table if not exists app_docks (
    space             TEXT NOT NULL,
    dock              text not null default '[]'
);
create unique index if not exists app_docks_uindex on app_docks (space);


create table if not exists app_recommendations (
    id                TEXT NOT NULL
);
create unique index if not exists app_recommendations_uindex on app_recommendations (id);

create table if not exists spaces_stalls (
    space             TEXT NOT NULL,
    suite             TEXT NOT NULL,
    recommended       TEXT NOT NULL
);
create unique index if not exists spaces_stalls_uindex on spaces_stalls (space);

`;
