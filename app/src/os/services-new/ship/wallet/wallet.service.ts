import APIConnection from '../../conduit';
import AbstractService, { ServiceOptions } from '../../abstract.service';
import { UqbarApi } from '../../../api/uqbar';
import { Database } from 'better-sqlite3-multiple-ciphers';
import { WalletApi } from '../../../api/wallet';
import log from 'electron-log';

export class WalletService extends AbstractService {
  constructor(options?: ServiceOptions, db?: Database) {
    super('walletService', options);
    if (options?.preload) {
      return;
    }
    this._onEvent = this._onEvent.bind(this);
    APIConnection.getInstance().conduit.watch({
      app: 'realm-wallet',
      path: `/updates`,
      onEvent: this._onEvent,
      onQuit: this._onQuit,
      onError: this._onError,
    });
  }

  private _onEvent = (data: any, _id?: number, mark?: string) => {
    console.log('wallet event', data, _id, mark);
  };

  private _onQuit = () => {
    log.warn('Wallet subscription quit');
  };

  private _onError = (err: any) => {
    log.warn('Wallet subscription error', err);
  };

  async uqbarDeskExists(_evt: any) {
    return await UqbarApi.uqbarDeskExists(APIConnection.getInstance().conduit);
  }

  async setPasscodeHash(passcodeHash: string) {
    await WalletApi.setPasscodeHash(
      APIConnection.getInstance().conduit,
      passcodeHash
    );
  }

  async setXpub(network: string, hash: string) {
    await WalletApi.setXpub(APIConnection.getInstance().conduit, network, hash);
  }
}

export default WalletService;

// Generate preload
export const walletPreload = WalletService.preload(
  new WalletService({ preload: true })
);
