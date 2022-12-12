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

  watchUpdates(conduit: any, walletState: WalletStoreType) {
    const lastProtocol: BaseProtocol = this.protocols.get(
      this.currentProtocol
    )!;
    lastProtocol?.removeListener();
    this.currentProtocol = walletState.navState.protocol;
    if (walletState.navState.network === NetworkType.ETHEREUM) {
      const protocol = this.protocols.get(
        this.currentProtocol
      ) as EthereumProtocol;
      protocol.watchUpdates(conduit, walletState);
    }
  }

  updateWalletState(conduit: any, walletState: WalletStoreType) {
    if (walletState.navState.network === NetworkType.ETHEREUM) {
      this.protocols
        .get(walletState.navState.protocol)!
        .watchUpdates(conduit, walletState);
    }
  }
}

export type WalletEventCallback = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
};
