import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { action, makeObservable, observable } from 'mobx';
import { Patp } from 'types';
import { ProtocolWallet } from 'wallets/ProtocolWallet';
import { NetworkType, ProtocolType, WalletView, WalletNavState, WalletNavOptions } from 'wallets/types';
import { getSnapshot, cast } from 'mobx-state-tree';

export class Wallet extends (EventEmitter as new () => TypedEmitter<WalletEventCallback>) {
  wallets: Map<NetworkType, Map<ProtocolType, ProtocolWallet>>;
  currentNetwork: NetworkType;
  currentProtocol: ProtocolType;
  settings: any;
  navState: WalletNavStateType;
  navHistory: any;
  lastInteraction: Date;

  constructor(wallets: Map<NetworkType, Map<ProtocolType, ProtocolWallet>>, currentNetwork: NetworkType, currentProtocol: ProtocolType) {
    super();
    this.wallets = wallets;
    this.currentNetwork = currentNetwork;
    this.currentProtocol = currentProtocol;
    this.lastInteraction = new Date();

    makeObservable(this, {
      wallets: observable,
      currentNetwork: observable,
      currentProtocol: observable,
      setSettings: action.bound,
    });
  }

  setCurrentNetwork(currentNetwork: NetworkType) {
    this.currentNetwork = currentNetwork;
  }

  setCurrentProtocol(currentProtocol: ProtocolType) {
    this.currentProtocol = currentProtocol;

  }

  setSettings(settings: any) {
    this.settings = settings;
  }

  resetNavigation() {
    this.navState = WalletNavState.create({
      view: WalletView.LIST,
      network: this.navState.network,
      btcNetwork: this.navState.btcNetwork,
    });
    this.navHistory = cast([]);
  }

  setLastInteraction(date: Date) {
    this.lastInteraction = date;
  }

  navigate(view: WalletView, options?: WalletNavOptions) {
    const canReturn = options?.canReturn || true;
    const walletIndex = options?.walletIndex || this.navState.walletIndex;
    const detail = options?.detail;
    const action = options?.action;
    const network = options?.network || this.navState.network;

    if (
      canReturn &&
      ![WalletView.LOCKED, WalletView.NEW].includes(this.navState.view)
    ) {
      const returnSnapshot = getSnapshot(this.navState);
      this.navHistory.push(WalletNavState.create(returnSnapshot));
    }

    const newState = WalletNavState.create({
      view,
      walletIndex,
      detail,
      action,
      network,
      btcNetwork: this.navState.btcNetwork,
    });
    this.navState = newState;
  }

  navigateBack() {
    const DEFAULT_RETURN_VIEW = WalletView.LIST;
    let returnSnapshot = getSnapshot(
      WalletNavState.create({
        view: DEFAULT_RETURN_VIEW,
        network: this.navState.network,
        btcNetwork: this.navState.btcNetwork,
      })
    );

    if (this.navHistory.length) {
      returnSnapshot = getSnapshot(this.navHistory.pop()!);
    }

    this.navState = WalletNavState.create(returnSnapshot);
  }
}

export type WalletEventCallback = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
};
