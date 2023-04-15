import { Database } from 'better-sqlite3-multiple-ciphers';
import log from 'electron-log';
import AbstractService, { ServiceOptions } from '../../abstract.service';
import { APIConnection } from '@holium/conduit';
import { AppCatalogDB } from './tables/catalog.table';
import { pathToObj } from '../../../lib/path';

export class BazaarService extends AbstractService {
  private tables?: {
    appCatalog: AppCatalogDB;
  };
  constructor(options?: ServiceOptions, db?: Database) {
    super('bazaarService', options);
    if (options?.preload) {
      return;
    }
    this.tables = {
      appCatalog: new AppCatalogDB({ preload: false, name: 'appCatalog', db }),
    };

    this._onEvent = this._onEvent.bind(this);
    this._onError = this._onError.bind(this);
    this._onQuit = this._onQuit.bind(this);

    APIConnection.getInstance().conduit.watch({
      app: 'bazaar',
      path: `/updates`,
      onEvent: this._onEvent,
      onError: this._onError,
      onQuit: this._onQuit,
    });
  }

  reset(): void {
    super.reset();
    this.tables?.appCatalog.reset();
  }

  private _onEvent = (data: any, _id?: number, mark?: string) => {
    // log.info('bazaar event => %o', data);
    if (mark === 'bazaar-reaction') {
      const spacesType = Object.keys(data)[0];
      switch (spacesType) {
        case 'initial':
          this.tables?.appCatalog.insertAll(data['initial']);
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
        case 'pinned':
          const pinnedDock = this.tables?.appCatalog.updatePinned(
            data.pinned,
            'add'
          );
          this.sendUpdate({
            type: 'dock-update',
            payload: {
              path: data.pinned.path,
              dock: pinnedDock,
            },
          });
          break;
        case 'unpinned':
          const unpinnedDock = this.tables?.appCatalog.updatePinned(
            data.unpinned,
            'remove'
          );
          this.sendUpdate({
            type: 'dock-update',
            payload: {
              path: data.unpinned.path,
              dock: unpinnedDock,
            },
          });
          break;
        case 'pins-reodered':
          // TODO
          log.info('pins-reodered => %o', data['pins-reodered']);
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
          log.info('stall-update => %o', data['stall-update']);
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
            type: 'stall-update',
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
    const ally = APIConnection.getInstance().conduit.poke({
      app: 'treaty',
      mark: 'ally-update-0',
      json: {
        add: ship,
      },
    });
    log.info('addAlly', ally);
  }

  async removeAlly(ship: string) {
    const ally = APIConnection.getInstance().conduit.poke({
      app: 'treaty',
      mark: 'ally-update-0',
      json: {
        del: ship,
      },
    });

    log.info('removeAlly', ally);
  }

  async scryHash(app: string) {
    return APIConnection.getInstance().conduit.scry({
      app: 'bazaar',
      path: `/app-hash/${app}`,
    });
  }

  async scryAllies() {
    // todo error handle
    const response = APIConnection.getInstance().conduit.scry({
      app: 'bazaar',
      path: '/allies',
    });
    // @ts-ignore
    return response.allies;
  }

  async scryTreaties(ship: string) {
    const response = APIConnection.getInstance().conduit.scry({
      app: 'bazaar',
      path: `/treaties/${ship}`,
    });
    // @ts-ignore
    return response.treaties;
  }

  // async addRecentApp(appId: string) {
  //   return this.models.bazaar.addRecentApp(appId);
  // }

  // async addRecentDev(shipId: string) {
  //   return this.models.bazaar.addRecentDev(shipId);
  // }
}

export default BazaarService;

// Generate preload
export const bazaarPreload = BazaarService.preload(
  new BazaarService({ preload: true })
);
