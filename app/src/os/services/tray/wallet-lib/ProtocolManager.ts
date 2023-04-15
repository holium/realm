import { EthereumProtocol } from '../wallet/protocols/ethereum';

import { BaseProtocol } from './wallets/BaseProtocol';
import { Patp } from './types';
import { NetworkType, ProtocolType, WalletStoreType } from './wallet.model';

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
    if (
      this.currentProtocol === ProtocolType.ETH_MAIN ||
      this.currentProtocol === ProtocolType.ETH_GORLI
    ) {
      (
        this.protocols.get(this.currentProtocol) as EthereumProtocol
      ).removeListener();
    }
  }

  watchUpdates(conduit: any, walletState: WalletStoreType) {
    if (
      this.currentProtocol === ProtocolType.ETH_MAIN ||
      this.currentProtocol === ProtocolType.ETH_GORLI
    ) {
      const lastProtocol = this.protocols.get(
        this.currentProtocol
      ) as EthereumProtocol;
      lastProtocol?.removeListener();
    }
    this.currentProtocol = walletState.navState.protocol;
    if (
      this.currentProtocol === ProtocolType.ETH_MAIN ||
      this.currentProtocol === ProtocolType.ETH_GORLI
    ) {
      (
        this.protocols.get(this.currentProtocol) as EthereumProtocol
      ).watchUpdates(conduit, walletState);
    } else if (this.currentProtocol === ProtocolType.UQBAR) {
      this.protocols
        .get(this.currentProtocol)
        ?.updateWalletState(conduit, walletState);
    }
  }

  updateWalletState(
    conduit: any,
    walletState: WalletStoreType,
    protocol?: ProtocolType
  ) {
    if (walletState.navState.network === NetworkType.ETHEREUM) {
      (
        this.protocols.get(
          protocol || walletState.navState.protocol
        ) as EthereumProtocol
      ).updateWalletState(conduit, walletState);
    }
  }
}

export type WalletEventCallback = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
};
