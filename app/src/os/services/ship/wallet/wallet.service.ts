import log from 'electron-log';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3-multiple-ciphers';
import { ethers } from 'ethers';

import AbstractService, { ServiceOptions } from '../../abstract.service';
import { APIConnection } from '../../api';

import { BaseBlockProtocol } from './protocols/BaseBlockProtocol';
import { BaseProtocol } from './protocols/BaseProtocol';
import { EthereumProtocol } from './protocols/ethereum';
import { ProtocolManager } from './protocols/ProtocolManager';
import { RealmSigner } from './signers/realm';
import { WalletDB, walletDBPreload } from './wallet.db';
import { ProtocolType, UISettingsType } from './wallet.types';

export class WalletService extends AbstractService {
  public walletDB?: WalletDB;
  private protocolManager?: ProtocolManager;
  constructor(options?: ServiceOptions, db?: Database) {
    super('walletService', options);
    if (options?.preload) {
      return;
    }
    this.walletDB = new WalletDB({ preload: false, db });
    const protocolMap = new Map<ProtocolType, BaseProtocol>([
      [ProtocolType.ETH_MAIN, new EthereumProtocol(ProtocolType.ETH_MAIN)],
      [ProtocolType.ETH_GORLI, new EthereumProtocol(ProtocolType.ETH_GORLI)],
      // [ProtocolType.UQBAR, new UqbarProtocol()],
    ]);
    this.protocolManager = new ProtocolManager(
      protocolMap,
      ProtocolType.ETH_GORLI
    );
  }

  public reset(): void {
    super.removeHandlers();
    this.walletDB?.reset();
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

  async checkPasscodeHash(passcode: number[]) {
    return await bcrypt.compare(
      passcode.map(String).join(''),
      (
        await APIConnection.getInstance().conduit.scry({
          app: 'realm-wallet',
          path: '/passcode',
        })
      ).passcode ?? ''
    );
  }

  async hasPasscodeHash() {
    return (
      (await APIConnection.getInstance().conduit.scry({
        app: 'realm-wallet',
        path: '/passcode',
      })) !== null
    );
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

  async saveTransactionNotes(
    network: string,
    net: string,
    wallet: number,
    contract: string | null,
    hash: string,
    notes: string
  ) {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'save-transaction-notes': {
          network,
          net,
          wallet,
          contract,
          hash,
          notes,
        },
      },
    };
    await APIConnection.getInstance().conduit.poke(payload);
  }

  watchUpdates(protocol: ProtocolType) {
    if (!this.walletDB) throw new Error('Wallet DB not initialized');
    log.info('GOT THE SERVICE WATCH UPDATES');
    log.info('protocolManager', this.protocolManager);
    this.protocolManager?.watchUpdates(
      APIConnection.getInstance().conduit,
      this.walletDB,
      protocol
    );
  }

  pauseUpdates() {
    this.protocolManager?.pauseUpdates();
  }

  async checkMnemonic(mnemonic: string) {
    const ethXpub = ethers.utils.HDNode.fromMnemonic(mnemonic)
      .derivePath("m/44'/60'/0'")
      .neuter().extendedKey;
    const agentEthXpub = (
      await APIConnection.getInstance().conduit.scry({
        app: 'realm-wallet',
        path: '/eth-xpub',
      })
    )['eth-xpub'];
    return ethXpub === agentEthXpub;
  }

  async hasMnemonic(patp: string) {
    return RealmSigner.hasMnemonic(patp);
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
