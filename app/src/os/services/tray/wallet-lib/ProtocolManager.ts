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
    if (this.currentProtocol === ProtocolType.ETH_MAIN || this.currentProtocol === ProtocolType.ETH_GORLI) {
      (this.protocols.get(this.currentProtocol)! as EthereumProtocol).removeListener();
    }
  }

  watchUpdates(conduit: any, walletState: WalletStoreType) {
    if (this.currentProtocol === ProtocolType.ETH_MAIN || this.currentProtocol === ProtocolType.ETH_GORLI) {
      const lastProtocol = this.protocols.get(
        this.currentProtocol
      )! as EthereumProtocol;
      lastProtocol?.removeListener();
    }
    this.currentProtocol = walletState.navState.protocol;
    if (walletState.navState.network === NetworkType.ETHEREUM) {
      this.protocols.get(
        this.currentProtocol
      )!.watchUpdates(conduit, walletState);
    }
  }

  updateWalletState(conduit: any, walletState: WalletStoreType) {
    if (walletState.navState.network === NetworkType.ETHEREUM) {
      (this.protocols
        .get(walletState.navState.protocol)! as EthereumProtocol)
        .updateWalletState(conduit, walletState);
    }
  }
}

export type WalletEventCallback = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
};
