import {
  BaseProtocol,
} from '@holium/realm-wallet/src/wallets/BaseProtocol';
// @ts-expect-error
import abi from 'human-standard-token-abi';
// @ts-expect-error
import nftabi from 'non-fungible-token-abi';
import { WalletStoreType, Asset } from '@holium/realm-wallet/src/wallet.model';

export class UqbarProtocol extends BaseProtocol {
  watchUpdates(walletState: WalletStoreType) {
    
  }
  removeListener() {

  }
  getAccountBalance(addr: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getAccountTransactions(addr: string, startBlock: number): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
  getAccountAssets(addr: string): Promise<Asset[]> {
    throw new Error('Method not implemented.');
  }
  sendTransaction(signedTx: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  getAssetBalance(contract: string, addr: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getAssetMetadata(contract: string, addr: string): Promise<Asset> {
    throw new Error('Method not implemented.');
  }
  getAssetAllowance(contract: string, addr: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getAssetTransfers(contract: string, addr: string): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
  transferAsset(contract: string, toAddr: string, amountOrTokenId: string | number): void | Promise<void> {
    throw new Error('Method not implemented.');
  }
  getFeePrice(): number | Promise<number> {
    throw new Error('Method not implemented.');
  }
  getFeeEstimate(from: string, to: string, value: number): number | Promise<number> {
    throw new Error('Method not implemented.');
  }

}