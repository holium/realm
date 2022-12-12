import { Patp } from './types';
import { BaseProtocol } from './wallets/BaseProtocol';
import { NetworkType, ProtocolType, WalletStoreType } from './wallet.model';
import { EthereumProtocol } from '../wallet/protocols/ethereum';

export class Wallet {
  protocols: Map<ProtocolType, BaseProtocol>;
  currentProtocol: ProtocolType;

  constructor(
    protocols: Map<ProtocolType, BaseProtocol>,
    currentProtocol: ProtocolType
  ) {
    this.protocols = protocols;
    this.currentProtocol = currentProtocol;
  }

  pauseUpdates() {
    this.protocols.get(this.currentProtocol)!.removeListener();
  }

  watchUpdates(walletState: WalletStoreType) {
    const lastProtocol: BaseProtocol = this.protocols.get(
      this.currentProtocol
    )!;
    lastProtocol?.removeListener();
    this.currentProtocol = walletState.navState.protocol;
    if (walletState.navState.network === NetworkType.ETHEREUM) {
      this.protocols.get(this.currentProtocol)!.watchUpdates(walletState);
    }
  }

  updateWalletState(walletState: WalletStoreType) {
    if (walletState.navState.network === NetworkType.ETHEREUM) {
      this.protocols.get(walletState.navState.protocol)!.watchUpdates(walletState);
    }
  }
}

export type WalletEventCallback = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
};
