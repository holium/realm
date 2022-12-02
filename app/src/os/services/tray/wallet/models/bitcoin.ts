import { BaseProtocol } from '@holium/realm-wallet/src/wallets/BaseProtocol';
import { Account, Asset } from '@holium/realm-wallet/src/wallets/types';

class BitcoinProtocol extends BaseProtocol {

    subscribe() {

    }

    unsubscribe() {

    }

    getAccounts(): Account[] | Promise<Account[]> {
        
    }

    getAccountBalance(addr: string): number {

    }

    getAccountTransactions(addr: string): Promise<any[]> {
        
    }

    getAccountAssets(addr: string): Asset[] | Promise<Asset[]> {
        
    }

    sendTransaction(signedTx: string): Promise<any> {
        
    }

    getAsset(contract: string, addr: string): Asset {
        
    }

    getAssetBalance(contract: string, addr: string): number {
        
    }

    getAssetMetadata(contract: string, addr: string): Asset | Promise<Asset> {
        
    }

    getAssetAllowance(contract: string, addr: string): number {
        
    }

    getAssetTransfers(contract: string, addr: string): Promise<any[]> {
        
    }

    transferAsset(contract: string, toAddr: string, amountOrTokenId: string | number): void {
        
    }


    getFeePrice(): number | Promise<number> {
        
    }

    getFeeEstimate(from: string, to: string, value: number): number | Promise<number> {
        
    }


}
