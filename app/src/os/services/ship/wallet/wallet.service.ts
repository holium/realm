import { APIConnection } from '../../api';
import AbstractService, { ServiceOptions } from '../../abstract.service';
import { Database } from 'better-sqlite3-multiple-ciphers';
import { RealmSigner } from './signers/realm';
import { WalletDB, walletDBPreload } from './wallet.db';
import { ethers } from 'ethers';
import {
  ProtocolType,
  UISettingsType,
} from 'renderer/stores/models/wallet.model';
import { ProtocolManager } from './protocols/ProtocolManager';
import { EthereumProtocol } from './protocols/ethereum';
import { BaseBlockProtocol } from './protocols/BaseBlockProtocol';

export class WalletService extends AbstractService {
  public walletDB?: WalletDB;
  private protocolManager?: ProtocolManager;
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

  async sendTransaction(
    currentProtocol: ProtocolType,
    path: string,
    ourPatp: string,
    passcode: string,
    from: string,
    to: string,
    amount: string
  ) {
    const protocol = this.protocolManager?.protocols.get(
      currentProtocol
    ) as EthereumProtocol;
    const tx = {
      from,
      to,
      value: ethers.utils.parseEther(amount),
      gasLimit: await protocol.getFeeEstimate({
        to,
        from,
        value: ethers.utils.parseEther(amount),
      }),
      gasPrice: await protocol.getFeePrice(),
      nonce: await protocol.getNonce(from),
      chainId: await protocol.getChainId(),
    };
    const signedTx = await RealmSigner.signTransaction(
      path,
      tx,
      ourPatp,
      passcode
    );
    const hash = await (
      this.protocolManager?.protocols.get(currentProtocol) as BaseBlockProtocol
    ).sendTransaction(signedTx);
    return { hash, tx };
  }

  async setSettings(network: string, settings: UISettingsType) {
    await APIConnection.getInstance().conduit.poke({
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'set-network-settings': {
          network,
          mode: settings.walletCreationMode,
          who: settings.sharingMode,
          blocked: settings.blocked,
          'share-index': settings.defaultIndex,
        },
      },
    });
  }

  async deleteLocalMnemonic(ourPatp: string, passcode: string) {
    RealmSigner.deleteMnemonic(ourPatp, passcode);
  }

  async deleteShipMnemonic(ourPatp: string, passcode: string) {
    RealmSigner.deleteMnemonic(ourPatp, passcode);
    await APIConnection.getInstance().conduit.poke({
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        initialize: null,
      },
    });
  }

  async getAddress(patp: string, network: string) {
    try {
      const address: any = await APIConnection.getInstance().conduit.poke({
        app: 'realm-wallet',
        mark: 'realm-wallet-action',
        json: {
          'get-address': {
            network: network,
            patp,
          },
        },
      });
      return address;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

export default WalletService;

// Generate preload
const walletServiceInstance = WalletService.preload(
  new WalletService({ preload: true })
);

export const walletPreload = {
  ...walletServiceInstance,
  ...walletDBPreload,
};
