import { BaseProtocol } from '../../wallet-lib/wallets/BaseProtocol';
import { WalletStoreType } from 'os/services/tray/wallet-lib/wallet.model';
import { Conduit } from '@holium/conduit';
import { UqbarApi } from '../../../../api/uqbar';

export class UqbarProtocol implements BaseProtocol {
  updateWalletState(conduit: Conduit, walletState: WalletStoreType) {
    for (const walletKey of walletState.ethereum.wallets.keys()) {
      const wallet = walletState.ethereum.wallets.get(walletKey);
      const walletAddress = wallet?.address;
      const walletNickname = wallet?.nickname;
      if (walletAddress && walletNickname) {
        UqbarApi.trackAddress(conduit, walletAddress, walletNickname);
      }
    }
  }

  async submitSigned(_conduit: Conduit, _signedTx: string): Promise<any> {
    // UqbarApi.submitSigned(conduit, from, hash, rate, bud, ethHash, sig);
  }
}
