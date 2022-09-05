import { ipcMain, ipcRenderer } from 'electron';
import { ethers, Wallet } from 'ethers';
import {
  onPatch,
  onSnapshot,
  getSnapshot,
  castToSnapshot,
} from 'mobx-state-tree';
import { WalletApi } from '../../api/wallet';

import Realm from '../..';
import { BaseService } from '../base.service';
import {
  WalletStore,
  WalletStoreType,
} from './wallet.model';

export class WalletService extends BaseService {
  private state?: WalletStoreType; // for state management
  private privateKey: ethers.utils.HDNode;
  handlers = {
    'realm.tray.wallet.set-xpub': this.setXpub,
    'realm.tray.wallet.set-wallet-creation-mode': this.setWalletCreationMode,
    'realm.tray.wallet.change-default-wallet': this.changeDefaultWallet,
    'realm.tray.wallet.create-wallet': this.createWallet,
    'realm.tray.wallet.enqueue-transaction': this.enqueueTransaction,
  };

  static preload = {
    setXpub: () => {
      return ipcRenderer.invoke('realm.tray.wallet.set-xpub');
    },
    createWallet: (sender: string, network: string) => {
      return ipcRenderer.invoke('realm.tray.wallet.create-wallet', sender, network);
    }
  };

  constructor(core: Realm, options: any = {}) {
    super(core, options);

    // this.core.conduit!.desk = 'realm';
    const mnemonic = 'carry poem leisure coffee issue urban save evolve catch hammer simple unknown';
    this.privateKey = ethers.utils.HDNode.fromMnemonic(mnemonic);

    this.state = WalletStore.create({
        network: 'ethereum',
        currentView: 'ethereum:list',
        ethereum: {},
        bitcoin: {}
    });

    onPatch(this.state, (patch) => {
      const patchEffect = {
        patch,
        resource: 'wallet',
        response: 'patch',
      };
      this.core.onEffect(patchEffect);
    });

    const patchEffect = {
      model: getSnapshot(this.state),
      resource: 'wallet',
      response: 'initial',
    };
    this.core.onEffect(patchEffect);

    Object.keys(this.handlers).forEach((handlerName: any) => {
      // @ts-ignore
      ipcMain.handle(handlerName, this.handlers[handlerName].bind(this));
    });


    WalletApi.subscribeToWallets(this.core.conduit!, (wallet: any) => {
      if (wallet.network === 'ethereum') {
        this.state!.ethereum.applyWalletUpdate(wallet);
      }
      if (wallet.network === 'bitcoin') {
        this.state!.bitcoin.applyWalletUpdate(wallet);
      }
    })
    WalletApi.getWallets(this.core.conduit!).then((wallets: any) => {
      this.state!.ethereum.initial(wallets);
    });
  }

  get snapshot() {
    return this.state ? getSnapshot(this.state) : null;
  }

  async setXpub(_event: any) {
    let xpub: string = this.privateKey.neuter().extendedKey;
    await WalletApi.setXpub(this.core.conduit!, xpub);
  }

  async setWalletCreationMode(_event: any, mode: string) {
    await WalletApi.setWalletCreationMode(this.core.conduit!, mode);
  }

  async changeDefaultWallet(_event: any, network: string, index: number) {
    await WalletApi.changeDefaultWallet(this.core.conduit!, network, index);
  }

  async createWallet(_event: any, sender: string, network: string) {
    await WalletApi.createWallet(this.core.conduit!, sender, network);
  }

  async enqueueTransaction(_event: any, network: string, transaction: any) {
    await WalletApi.enqueueTransaction(this.core.conduit!, network, transaction);
  }

}