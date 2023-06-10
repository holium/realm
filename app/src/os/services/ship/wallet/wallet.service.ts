import log from 'electron-log';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3-multiple-ciphers';
import CoinGecko from 'coingecko-api';
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
  private coingecko?: CoinGecko;

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
    this.coingecko = new CoinGecko();
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
    const response = await APIConnection.getInstance().conduit.scry({
      app: 'realm-wallet',
      path: '/passcode',
    });
    log.warn('response', response);
    log.warn(
      'trying',
      (
        await APIConnection.getInstance().conduit.scry({
          app: 'realm-wallet',
          path: '/passcode',
        })
      ).passcode ?? ''
    );
    const passcodeHash =
      (
        await APIConnection.getInstance().conduit.scry({
          app: 'realm-wallet',
          path: '/passcode',
        })
      ).passcode ?? '';
    return await bcrypt.compare(passcode.map(String).join(''), passcodeHash);
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
          transaction: tx,
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

  async sendTransaction({
    currentProtocol,
    path,
    ourPatp,
    passcode,
    from,
    to,
    amount,
  }: {
    currentProtocol: ProtocolType;
    path: string;
    ourPatp: string;
    passcode: string;
    from: string;
    to: string;
    amount: string;
  }) {
    log.warn('getting protocol');
    const protocol = this.protocolManager?.protocols.get(
      currentProtocol
    ) as EthereumProtocol;
    log.warn('protocol', protocol);

    // const gasLimit = await protocol.getFeeEstimate({
    //   to,
    //   from,
    //   value: ethers.utils.parseEther(amount),
    // });
    const gasPrice = await protocol.getFeePrice();
    const nonce = await protocol.getNonce(from);
    const chainId = await protocol.getChainId();
    log.warn('chainId', chainId);

    const transaction = {
      from,
      to,
      value: ethers.utils.parseEther(amount),
      gasLimit: ethers.utils.hexlify(21000),
      gasPrice,
      nonce,
      chainId,
    };
    log.warn('transaction', transaction);
    const signedTx = await RealmSigner.signTransaction({
      path,
      transaction,
      patp: ourPatp,
      passcode,
    });
    log.warn('signedTx', signedTx);

    const hash = await (
      this.protocolManager?.protocols.get(currentProtocol) as BaseBlockProtocol
    ).sendTransaction(signedTx);

    return { hash, tx: transaction };
  }

  async sendERC20Transaction(
    currentProtocol: ProtocolType,
    path: string,
    ourPatp: string,
    passcode: string,
    from: string,
    to: string,
    amount: string,
    contractAddress: string,
    decimals: number
  ) {
    const ethAmount = ethers.utils.parseEther(amount);
    const tx = await (
      this.protocolManager?.protocols.get(currentProtocol) as EthereumProtocol
    ).populateERC20(contractAddress, to, amount, decimals);
    const protocol = this.protocolManager?.protocols.get(
      currentProtocol
    ) as EthereumProtocol;
    tx.from = from;
    tx.gasLimit = await protocol.getFeeEstimate(tx);
    tx.gasPrice = await protocol.getFeePrice();
    tx.nonce = await protocol.getNonce(from);
    tx.chainId = await protocol.getChainId();
    const signedTx = await RealmSigner.signTransaction({
      path,
      transaction: tx,
      patp: ourPatp,
      passcode,
    });
    const hash = await (
      this.protocolManager?.protocols.get(currentProtocol) as BaseBlockProtocol
    ).sendTransaction(signedTx);
    return { hash, ethAmount };
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

  async deleteShipMnemonic(ourPatp: string, passcode?: string) {
    if (passcode) {
      RealmSigner.deleteMnemonic(ourPatp, passcode);
    } else {
      RealmSigner.forceDeleteMnemonic(ourPatp);
    }

    await APIConnection.getInstance().conduit.poke({
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        initialize: null,
      },
    });
  }

  async getAddress(network: string, from: string) {
    return new Promise((resolve, reject) => {
      APIConnection.getInstance().conduit.watch({
        app: 'realm-wallet',
        path: '/address/' + network + '/' + from,
        onEvent(data, _id, _mark) {
          log.info('success', data);
          resolve(data);
        },
        onError(_id, e) {
          log.info('error', e);
          resolve(null);
        },
        onQuit() {},
      });
    });
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
    this.protocolManager?.watchUpdates(this.walletDB, protocol);
  }

  updateWalletState(protocol: ProtocolType) {
    if (!this.walletDB) throw new Error('Wallet DB not initialized');
    this.protocolManager?.updateWalletState(this.walletDB, protocol);
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

  async getWalletsUpdate() {
    if (!this.walletDB) throw new Error('Wallet DB not initialized');

    const data = await this.walletDB.fetchWallets();
    this.walletDB.sendChainUpdate(data);
  }

  async getBitcoinPrice() {
    const response = await this.coingecko?.coins.fetch('bitcoin', {});
    return response?.data?.market_data?.current_price?.usd;
  }

  async getEthereumPrice() {
    const response = await this.coingecko?.coins.fetch('ethereum', {});
    return response?.data?.market_data?.current_price?.usd;
  }

  async getCoinPrice(coinName: string) {
    const response = await this.coingecko?.coins.fetch(coinName, {});
    return response?.data?.market_data?.current_price?.usd;
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
