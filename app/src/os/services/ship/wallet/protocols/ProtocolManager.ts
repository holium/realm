import { WalletDB } from '../wallet.db';
import { ProtocolType } from '../wallet.types';
import { BaseProtocol } from './BaseProtocol';
import { EthereumProtocol } from './ethereum';
import { Patp } from './types';

export class ProtocolManager {
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

  watchUpdates(conduit: any, walletState: WalletDB, protocol: ProtocolType) {
    if (
      this.currentProtocol === ProtocolType.ETH_MAIN ||
      this.currentProtocol === ProtocolType.ETH_GORLI
    ) {
      const lastProtocol = this.protocols.get(
        this.currentProtocol
      ) as EthereumProtocol;
      lastProtocol?.removeListener();
    }
    this.currentProtocol = protocol;
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
    walletState: WalletDB,
    protocol: ProtocolType
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
