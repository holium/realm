import { Patp } from 'types';
import { BaseProtocol } from 'wallets';
import { NetworkType, ProtocolType } from './wallet.model';

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

  watchUpdates(walletState: any) {
    const lastProtocol: BaseProtocol = this.protocols.get(
      this.currentProtocol
    )!;
    lastProtocol?.removeListener();
    this.currentProtocol = walletState.navState.protocol;
    if (walletState.navState.network === NetworkType.ETHEREUM) {
      this.protocols.get(this.currentProtocol)!.watchUpdates(walletState);
    }
  }
}

export type WalletEventCallback = {
  ready: () => void;
  providerUpdated: (provider: Patp) => void;
  hostLeft: (host: Patp) => void;
};
