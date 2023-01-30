import { BaseProtocol } from '../../wallet-lib/wallets/BaseProtocol';
// @ts-expect-error
// @ts-expect-error
import { WalletStoreType } from 'os/services/tray/wallet-lib/wallet.model';
import { Conduit } from '@holium/conduit';
import { UqbarApi } from '../../../../api/uqbar';

export class UqbarProtocol implements BaseProtocol {
  updateWalletState(conduit: Conduit, walletState: WalletStoreType) {
    for (const walletKey of walletState.ethereum.wallets.keys()) {
      const wallet = walletState.ethereum.wallets.get(walletKey)!;
      UqbarApi.trackAddress(conduit, wallet.address, wallet.nickname);
    }
  }

  async submitSigned(conduit: Conduit, signedTx: string): Promise<any> {
    UqbarApi.submitSigned(conduit, from, hash, rate, bud, ethHash, sig);
  }
}
