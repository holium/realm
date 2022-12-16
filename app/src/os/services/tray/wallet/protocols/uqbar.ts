import { BaseProtocol } from '../../wallet-lib/wallets/BaseProtocol';
// @ts-expect-error
import abi from 'human-standard-token-abi';
// @ts-expect-error
import nftabi from 'non-fungible-token-abi';
import {
  WalletStoreType,
  Asset,
} from 'os/services/tray/wallet-lib/wallet.model';
import { Conduit } from '@holium/conduit';

export class UqbarProtocol implements BaseProtocol {
  watchUpdates(conduit: Conduit, walletState: WalletStoreType) {

  }
}
