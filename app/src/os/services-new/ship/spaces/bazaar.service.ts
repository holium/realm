import { Database } from 'better-sqlite3-multiple-ciphers';
import log from 'electron-log';
import AbstractService, { ServiceOptions } from '../../abstract.service';
import APIConnection from '../../conduit';
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
    if (mark === 'bazaar-reaction') {
      const spacesType = Object.keys(data)[0];
      switch (spacesType) {
        case 'initial':
          this.tables?.appCatalog.insertAll(data['initial']);
          break;
        case 'app-install-update':
          // this.spacesDB?.insert(data['add']);
          break;
        case 'pinned':
          // this.spacesDB?.remove(data['remove']);
          break;
        case 'unpinned':
          // this.spacesDB?.replace(data['replace']);
          break;
        case 'pins-reodered':
          // when a remote space is added, we need to add it to our local db
          break;
        case 'suite-added':
          break;
        case 'suite-removed':
          break;
        case 'recommended':
          break;
        case 'unrecommended':
          // model._removeRecommended(data.unrecommended);
          break;
        case 'stall-update':
          // model._updateStall(data['stall-update']);
          break;
        case 'joined-bazaar':
          // model._addJoined(data['joined-bazaar']);
          break;
        case 'treaties-loaded':
          // model._treatiesLoaded();
          break;
        case 'new-ally':
          // const ally = data['new-ally'];
          // model._allyAdded(ally.ship, ally.desks);
          break;
        case 'ally-deleted':
          // console.log(data);
          // model._allyDeleted(data['ally-deleted'].ship);
          break;
        case 'rebuild-catalog':
          // console.log('rebuild-catalog => %o', data['rebuild-catalog']);
          // model._rebuildCatalog(data['rebuild-catalog']);
          // model._allyDeleted(data['ally-deleted'].ship);
          break;
        case 'rebuild-stall':
          // model._allyDeleted(data['ally-deleted'].ship);
          // model._rebuildStall(data['rebuild-stall']);
          break;
        case 'clear-stall':
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
        unpin: {
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
    return APIConnection.getInstance().conduit.poke({
      app: 'treaty',
      mark: 'ally-update-0',
      json: {
        add: ship,
      },
    });
  }

  async scryHash(app: string) {
    return APIConnection.getInstance().conduit.scry({
      app: 'bazaar',
      path: `/app-hash/${app}`,
    });
  }

  async scryAllies() {
    // todo error handle
    return (
      await APIConnection.getInstance().conduit.scry({
        app: 'bazaar',
        path: '/allies',
      })
    ).allies;
  }

  async scryTreaties(ship: string) {
    return APIConnection.getInstance().conduit.scry({
      app: 'bazaar',
      path: `/treaties/${ship}`,
    });
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
