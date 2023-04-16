import APIConnection from '../../conduit';
import AbstractService, { ServiceOptions } from '../../abstract.service';
import { Database } from 'better-sqlite3-multiple-ciphers';
import { RealmSigner } from './signers/realm';
import { WalletDB, walletDBPreload } from './wallet.db';

export class WalletService extends AbstractService {
  public walletDB?: WalletDB;
  constructor(options?: ServiceOptions, db?: Database) {
    super('walletService', options);
    if (options?.preload) {
      return;
    }
    this.walletDB = new WalletDB({ preload: false, db });
  }

  async uqbarDeskExists(_evt: any) {
    // return await UqbarApi.uqbarDeskExists(APIConnection.getInstance().conduit);
  }

  async setPasscodeHash(passcodeHash: string) {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'set-passcode-hash': {
          hash: passcodeHash,
        },
      },
    };
    await APIConnection.getInstance().conduit.poke(payload);
  }

  async setXpub(
    network: string,
    ethPath: string,
    ourPatp: any,
    passcode: string
  ) {
    const xpub = RealmSigner.getXpub(ethPath, ourPatp, passcode);
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'set-xpub': {
          network,
          xpub,
        },
      },
    };
    await APIConnection.getInstance().conduit.poke(payload);
  }

  async setMnemonic(mnemonic: string, ourPatp: string, passcode: string) {
    RealmSigner.setMnemonic(mnemonic, ourPatp, passcode);
  }

  async setTransaction(
    network: string,
    net: string,
    wallet: number,
    contract: string | null,
    hash: string,
    tx: any
  ) {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'set-transaction': {
          network,
          net,
          wallet,
          contract,
          hash,
          tx,
        },
      },
    };
    await APIConnection.getInstance().conduit.poke(payload);
  }

  async createWallet(sender: string, network: string, nickname: string) {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'create-wallet': {
          sndr: sender,
          network,
          nickname,
        },
      },
    };
    await APIConnection.getInstance().conduit.poke(payload);
  }
}

export default WalletService;

// Generate preload
const walletServiceInstance = WalletService.preload(
  new WalletService({ preload: true })
);

export const walletPreload = {
  ...walletDBPreload,
  ...walletServiceInstance,
};
