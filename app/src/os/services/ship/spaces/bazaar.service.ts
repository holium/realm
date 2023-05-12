import log from 'electron-log';
import Database from 'better-sqlite3-multiple-ciphers';

import { pathToObj } from '../../../lib/path';
import AbstractService, { ServiceOptions } from '../../abstract.service';
import { APIConnection } from '../../api';
import { BazaarUpdateType } from './bazaar.types';
import { AppPublishersTable } from './tables/appPublishers.table';
import { AppRecentsTable } from './tables/appRecents.table';
import { AppCatalogDB } from './tables/catalog.table';

export class BazaarService extends AbstractService<BazaarUpdateType> {
  private tables?: {
    appCatalog: AppCatalogDB;
    appPublishers: AppPublishersTable;
    appRecents: AppRecentsTable;
  };
  private shipDB?: Database;
  constructor(options?: ServiceOptions, db?: Database) {
    super('bazaarService', options);
    if (options?.preload) {
      return;
    }
    this.tables = {
      appCatalog: new AppCatalogDB({ preload: false, name: 'appCatalog', db }),
      appPublishers: new AppPublishersTable(false, db),
      appRecents: new AppRecentsTable(false, db),
    };

    this._onEvent = this._onEvent.bind(this);
    this._onError = this._onError.bind(this);
    this._onQuit = this._onQuit.bind(this);
    if (options?.verbose) {
      log.info('bazaar.service.ts:', 'Constructed.');
    }
  }

  async init() {
    return new Promise((resolve, reject) => {
      APIConnection.getInstance().conduit.watch({
        app: 'bazaar',
        path: `/updates`,
        onEvent: (
          data: any,
          id?: number | undefined,
          mark?: string | undefined
        ) => {
          this._onEvent(data, id, mark);
          resolve(true);
        },
        onError: (_id, e) => {
          reject(e);
          this._onError(e);
        },
        onQuit: this._onQuit,
      });
    });
  }

  reset(): void {
    super.removeHandlers();
    this.tables?.appCatalog.reset();
  }

  private _onEvent = (data: any, _id?: number, mark?: string) => {
    if (mark === 'bazaar-reaction') {
      const spacesType = Object.keys(data)[0];
      switch (spacesType) {
        case 'initial':
          this.shipDB?.exec(`
            DELETE FROM spaces_stalls;
            DELETE FROM app_docks;
            DELETE FROM app_recommendations;
            DELETE FROM app_catalog;
          `);
          this.tables?.appCatalog.insertAll(data['initial']);
          this.sendUpdate({
            type: 'initial',
            payload: this.tables?.appCatalog.getCatalog(),
          });
          break;
        case 'app-install-update': //  installed, uninstalled, started, etc.
          const { appId, app, grid } = data['app-install-update'];
          this.tables?.appCatalog.updateApp(appId, app);
          this.tables?.appCatalog.updateGrid(grid);
          const updatedApp = this.tables?.appCatalog.getApp(appId);
          this.sendUpdate({
            type: 'installation-update',
            payload: updatedApp,
          });
          break;
        case 'dock-update':
          const payload = data['dock-update'];
          const pinnedDock = this.tables?.appCatalog.updateDock(payload);
          this.sendUpdate({
            type: 'dock-update',
            payload: {
              path: payload.path,
              dock: pinnedDock,
            },
          });
          break;
        case 'suite-added':
          const addedStall = this.tables?.appCatalog.updateSuite(
            data['suite-added'],
            'add'
          );
          this.sendUpdate({
            type: 'stall-update',
            payload: {
              path: data['suite-added'].path,
              stall: addedStall,
            },
          });
          break;
        case 'suite-removed':
          const removedStall = this.tables?.appCatalog.updateSuite(
            data['suite-removed'],
            'remove'
          );
          this.sendUpdate({
            type: 'stall-update',
            payload: {
              path: data['suite-removed'].path,
              stall: removedStall,
            },
          });
          break;
        case 'recommended':
          this.tables?.appCatalog.updateRecommendations(
            data.recommended,
            'add'
          );
          this.sendUpdate({
            type: 'recommended',
            payload: {
              appId: data.recommended.id,
            },
          });
          break;
        case 'unrecommended':
          this.tables?.appCatalog.updateRecommendations(
            data.unrecommended,
            'remove'
          );
          this.sendUpdate({
            type: 'unrecommended',
            payload: {
              appId: data.unrecommended.id,
            },
          });
          break;
        case 'stall-update':
          const stallUpdate = data['stall-update'];
          // TODO come up with better solution for p2p app discovery
          if ('add-app' in stallUpdate) {
            const app = stallUpdate['add-app'];
            this.tables?.appCatalog.updateApp(app.id, app);
            // send new app to app catalog
            const updatedApp = this.tables?.appCatalog.getApp(app.id);
            this.sendUpdate({
              type: 'installation-update',
              payload: updatedApp,
            });
          } else if ('remove-app' in data) {
            // this breaks the app catalog
            // const appId: string = data['remove-app'];
          }
          const updatedStall = this.tables?.appCatalog.updateStall(
            stallUpdate.path,
            stallUpdate.stall
          );
          this.sendUpdate({
            type: 'stall-update',
            payload: {
              path: stallUpdate.path,
              stall: updatedStall,
            },
          });

          break;
        case 'joined-bazaar': // stall, path, catalog
          const joinedBazaar = data['joined-bazaar'];
          this.tables?.appCatalog.updateCatalog(joinedBazaar.catalog);
          const joinedStallUpdate = this.tables?.appCatalog.updateStall(
            joinedBazaar.path,
            joinedBazaar.stall
          );
          this.sendUpdate({
            type: 'joined-bazaar',
            payload: {
              path: joinedBazaar.path,
              stall: joinedStallUpdate,
            },
          });
          break;
        case 'rebuild-catalog':
          log.info('rebuild-catalog => %o', data['rebuild-catalog']);
          // console.log('rebuild-catalog => %o', data['rebuild-catalog']);
          // model._rebuildCatalog(data['rebuild-catalog']);
          // model._allyDeleted(data['ally-deleted'].ship);
          break;
        case 'rebuild-stall':
          log.info('rebuild-stall => %o', data['rebuild-stall']);
          // model._allyDeleted(data['ally-deleted'].ship);
          // model._rebuildStall(data['rebuild-stall']);
          break;
        case 'clear-stall':
          log.info('clear-stall => %o', data['clear-stall']);
          // model._clearStall(data['clear-stall']);
          // model._allyDeleted(data['ally-deleted'].ship);
          break;
        case 'treaties-loaded':
          log.info('treaties-loaded => %o', data['treaties-loaded']);
          this.sendUpdate({
            type: 'treaties-loaded',
            payload: data['treaties-loaded'],
          });
          break;
        case 'new-ally':
          log.info('new-ally => %o', data['new-ally']);
          this.sendUpdate({
            type: 'new-ally',
            payload: data['new-ally'],
          });
          this.sendUpdate({
            type: 'treaties-loaded',
            payload: data['new-ally'],
          });
          break;
        case 'ally-deleted':
          this.sendUpdate({
            type: 'ally-deleted',
            payload: data['ally-deleted'],
          });
          break;
        default:
          break;
      }
    }
  };
  private _onQuit = () => {
    log.warn('Spaces subscription quit');
  };
  private _onError = (err: any) => {
    log.warn('Spaces subscription error', err);
  };

  // ----------------------------------------------
  // ----------------- Fetches --------------------
  // ----------------------------------------------

  public async fetchAppCatalog() {
    return this.tables?.appCatalog.getCatalog();
  }

  // ----------------------------------------------
  // ----------------- Actions --------------------
  // ----------------------------------------------
  async suspendApp(desk: string) {
    return APIConnection.getInstance().conduit.poke({
      app: 'hood',
      mark: 'kiln-suspend',
      json: desk,
    });
  }
  async reviveApp(desk: string) {
    return APIConnection.getInstance().conduit.poke({
      app: 'hood',
      mark: 'kiln-revive',
      json: desk,
    });
  }

  async installApp(ship: string, desk: string) {
    return APIConnection.getInstance().conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        'install-app': {
          ship,
          desk,
        },
      },
    });
  }

  async uninstallApp(desk: string) {
    return APIConnection.getInstance().conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        'uninstall-app': {
          desk,
        },
      },
    });
  }
  /*
   return APIConnection.getInstance().conduit.poke({

    });
    */
  async pinApp(path: string, appId: string, index: number | null) {
    return APIConnection.getInstance().conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        pin: {
          path: pathToObj(path),
          'app-id': appId,
          index,
        },
      },
    });
  }

  async unpinApp(path: string, appId: string) {
    return APIConnection.getInstance().conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        unpin: {
          path: pathToObj(path),
          'app-id': appId,
        },
      },
    });
  }

  async reorderPinnedApps(path: string, dock: string[]) {
    return APIConnection.getInstance().conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        'reorder-pins': {
          path: pathToObj(path),
          dock,
        },
      },
    });
  }

  async addToSuite(path: string, appId: string, index: number) {
    return APIConnection.getInstance().conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        'suite-add': {
          path: pathToObj(path),
          'app-id': appId,
          index,
        },
      },
    });
  }

  async removeFromSuite(path: string, index: number) {
    return APIConnection.getInstance().conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        'suite-remove': {
          path: pathToObj(path),
          index,
        },
      },
    });
  }

  async recommendApp(appId: string) {
    return APIConnection.getInstance().conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        recommend: { 'app-id': appId },
      },
    });
  }

  async unrecommendApp(appId: string) {
    return APIConnection.getInstance().conduit.poke({
      app: 'bazaar',
      mark: 'bazaar-action',
      json: {
        unrecommend: { 'app-id': appId },
      },
    });
  }

  async addAlly(ship: string) {
    this.tables?.appPublishers.addAlly(ship);
  }

  async removeAlly(ship: string) {
    this.tables?.appPublishers.removeAlly(ship);
  }

  async scryHash(app: string) {
    return APIConnection.getInstance().conduit.scry({
      app: 'bazaar',
      path: `/app-hash/${app}`,
    });
  }

  async scryAllies() {
    // todo error handle
    const result = await APIConnection.getInstance().conduit.scry({
      app: 'bazaar',
      path: '/allies',
    });
    return this.tables?.appPublishers.insertAll(result.allies);
  }

  async scryTreaties(ship: string) {
    const result = await APIConnection.getInstance().conduit.scry({
      app: 'bazaar',
      path: `/treaties/${ship}`,
    });
    return result.treaties;
  }
}

export default BazaarService;

// Generate preload
export const bazaarPreload = BazaarService.preload(
  new BazaarService({ preload: true })
);
