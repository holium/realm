import { WalletDB } from '../wallet.db';
import { NetworkType } from '../wallet.types';
import { BaseProtocol } from './BaseProtocol';
import { EthereumProtocol } from './ethereum';
import { Patp } from './types';

export class ProtocolManager {
  protocols: Map<NetworkType, BaseProtocol>;
  currentProtocol: NetworkType;

  constructor(
    protocols: Map<NetworkType, BaseProtocol>,
    currentProtocol: NetworkType
  ) {
    this.protocols = protocols;
    this.currentProtocol = currentProtocol;
  }

  pauseUpdates() {
    if (
      this.currentProtocol === NetworkType.ETH_MAIN ||
      this.currentProtocol === NetworkType.ETH_GORLI
    ) {
      (
        this.protocols.get(this.currentProtocol) as EthereumProtocol
      ).removeListener();
    }
  }

  watchUpdates(conduit: any, walletState: WalletDB, protocol: NetworkType) {
    if (
      this.currentProtocol === NetworkType.ETH_MAIN ||
      this.currentProtocol === NetworkType.ETH_GORLI
    ) {
      const lastProtocol = this.protocols.get(
        this.currentProtocol
      ) as EthereumProtocol;
      lastProtocol?.removeListener();
    }
    this.currentProtocol = protocol;
    if (
      this.currentProtocol === NetworkType.ETH_MAIN ||
      this.currentProtocol === NetworkType.ETH_GORLI
    ) {
      (
        this.protocols.get(this.currentProtocol) as EthereumProtocol
      ).watchUpdates(conduit, walletState);
    } else if (this.currentProtocol === NetworkType.UQBAR) {
      this.protocols
        .get(this.currentProtocol)
        ?.updateWalletState(conduit, walletState);
    }
  }

  updateWalletState(
    conduit: any,
    walletState: WalletDB,
    protocol: NetworkType
  ) {
    (this.protocols.get(protocol) as EthereumProtocol).updateWalletState(
      conduit,
      walletState
    );
  }
}

export type WalletEventCallback = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
};
