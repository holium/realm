import { Conduit, ConduitState } from './index';
import log from 'electron-log';
import { deSig } from '@urbit/aura';

export type ConduitSession = {
  url: string;
  ship: string;
  code: string;
  cookie?: string;
};

export class APIConnection {
  private static instance: APIConnection;
  private conduitInstance: Conduit;
  // private isResuming = false;
  private isReconnecting = false;
  // private session: CondauitSession;

  private constructor(conduit: Conduit) {
    // this.session = session;
    this.conduitInstance = conduit;
    this.handleConnectionStatus(this.conduitInstance);
    this.conduitInstance
      .init(
        session.url,
        deSig(session.ship),
        session.cookie ?? '',
        session.code
      )
      .then(() => {
        this.handleConnectionStatus(this.conduitInstance);
      });
  }

  public static async getInstanceAsync(
    session: ConduitSession
  ): Promise<APIConnection> {
    if (!APIConnection.instance) {
      const conduit = new Conduit();
      await conduit.init(session.url, session.cookie ?? '', session.code);
      APIConnection.instance = new APIConnection(conduit);
    }
    return APIConnection.instance;
  }

  public static getInstance(session?: ConduitSession): APIConnection {
    if (!APIConnection.instance) {
      if (!session) {
        throw new Error(
          'API key must be provided on the first call to getInstance.'
        );
      }
      const conduit = new Conduit();
      conduit.init(session.url, session.cookie ?? '', session.code);
      APIConnection.instance = new APIConnection(conduit);
    }
    return APIConnection.instance;
  }

  get conduit(): Conduit {
    return this.conduitInstance;
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
    });
    conduit.on(ConduitState.Refreshing, () => {
      this.sendConnectionStatus(ConduitState.Refreshing);
    });
    conduit.on(ConduitState.Refreshed, (session) => {
      // console.info(`ConduitState.Refreshed => %o`, session);
      log.info(`ConduitState.Refreshed => %o`, session);
      // this.saveSession(session);
      this.sendConnectionStatus(ConduitState.Refreshed);
    });
    conduit.on(ConduitState.Connected, () => {
      this.sendConnectionStatus(ConduitState.Connected);
    });
    conduit.on(ConduitState.Disconnected, () =>
      this.sendConnectionStatus(ConduitState.Disconnected)
    );
    conduit.on(ConduitState.Connecting, () => {
      this.sendConnectionStatus(ConduitState.Connecting);
    });
    conduit.on(ConduitState.Failed, () => {
      // this.services.identity.auth.setLoader('error');
      // this.isResuming = false;
      this.isReconnecting = false;
      this.sendConnectionStatus(ConduitState.Failed);
    });
    conduit.on(ConduitState.Stale, () => {
      // this.sendLog('stale connection');
      this.sendConnectionStatus(ConduitState.Stale);
    });
  }

  sendConnectionStatus(status: ConduitState) {
    log.info(`sendConnectionStatus => %o`, status);
  }
}

export default APIConnection;
