import { app, BrowserWindow } from 'electron';
import log from 'electron-log';

import { Conduit, ConduitState } from './index';

export type ConduitSession = {
  url: string;
  ship: string;
  code: string;
  cookie: string | null;
};

export class APIConnection {
  private static instance: APIConnection;
  private conduitInstance: Conduit;
  private isReconnecting = false;
  private hasFailed = false;

  private constructor(session: ConduitSession) {
    this.conduitInstance = new Conduit(session.ship);
    this.handleConnectionStatus(this.conduitInstance);
    // this.conduitInstance
    //   .init(session.url, session.code, session.cookie ?? '')
    //   // .then(() => {
    //   //   log.info('Conduit initialized');
    //   // })
    //   .catch((e) => {
    //     log.error('Conduit initialization failed', e);
    //   });

    app.on('quit', () => {
      this.closeChannel();
      APIConnection.getInstance().conduit.removeAllListeners();
    });
  }

  public static async getInstanceAsync(
    session: ConduitSession
  ): Promise<APIConnection> {
    if (!APIConnection.instance) {
      const conduit = new Conduit(session.ship);
      await conduit.init(session.url, session.code, session.cookie ?? '');
      APIConnection.instance = new APIConnection(session);
    }
    return APIConnection.instance;
  }

  public static getInstance(session?: ConduitSession): APIConnection {
    if (!APIConnection.instance && !session) {
      throw new Error(
        'API key must be provided on the first call to getInstance.'
      );
    }
    if (session) {
      log.info('api-connection.ts:', 'Creating new APIConnection instance');
      if (APIConnection.instance) APIConnection.instance.conduit.cleanup();
      // if a session is provided, we can infer it is to create a new instance
      APIConnection.instance = new APIConnection(session);
    }
    return APIConnection.instance;
  }

  get conduit(): Conduit {
    return this.conduitInstance;
  }

  public async reconnect(): Promise<void> {
    this.isReconnecting = true;
    this.conduitInstance = await Conduit.reconnect(this.conduitInstance);
    this.isReconnecting = false;
  }

  public async closeChannel(): Promise<boolean> {
    return await this.conduitInstance.closeChannel();
  }
  /**
   * Relays the current connection status to renderer
   *
   * @param conduit
   */
  handleConnectionStatus(conduit: Conduit) {
    conduit.removeAllListeners();
    // conduit.on(ConduitState.Initialized, );
    conduit.on(ConduitState.Initialized, () => {
      if (!this.isReconnecting) {
        this.sendConnectionStatus(ConduitState.Initialized);
      }
      this.hasFailed = false;
    });
    conduit.on(ConduitState.Refreshing, () => {
      this.sendConnectionStatus(ConduitState.Refreshing);
    });
    conduit.on(ConduitState.Refreshed, () => {
      // console.info(`ConduitState.Refreshed => %o`, session);
      log.info('api-connection.ts:', `ConduitState.Refreshed`);
      // this.saveSession(session);
      this.sendConnectionStatus(ConduitState.Refreshed);
    });
    conduit.on(ConduitState.Connected, () => {
      this.sendConnectionStatus(ConduitState.Connected);
      this.hasFailed = false;
    });
    conduit.on(ConduitState.Disconnected, () => {
      if (!this.hasFailed) this.sendConnectionStatus(ConduitState.Disconnected);
    });
    conduit.on(ConduitState.Connecting, () => {
      this.sendConnectionStatus(ConduitState.Connecting);
    });
    conduit.on(ConduitState.Failed, () => {
      // this.services.identity.auth.setLoader('error');
      // this.isResuming = false;
      this.isReconnecting = false;
      this.hasFailed = true;
      this.sendConnectionStatus(ConduitState.Failed);
    });
    conduit.on(ConduitState.Stale, () => {
      // this.sendLog('stale connection');
      this.sendConnectionStatus(ConduitState.Stale);
    });
    conduit.on(ConduitState.NoInternet, () => {
      // this.sendLog('stale connection');
      this.sendConnectionStatus(ConduitState.NoInternet);
    });
  }

  sendConnectionStatus(status: ConduitState) {
    log.info(
      'api-connection.ts:',
      `sendConnectionStatus => %o`,
      status,
      this.conduit.uid
    );
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => {
      window.webContents.send(`realm.sendConnectionStatus`, status);
    });
  }
}

export default APIConnection;
