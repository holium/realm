import {
  BaseProtocol,
} from '@holium/realm-wallet/src/wallets/BaseProtocol';
import { Asset, CoinAsset } from '@holium/realm-wallet/src/wallets/types';
import { BaseAsset } from '@holium/realm-wallet/src/wallets/BaseAsset';
import { Alchemy, Network } from 'alchemy-sdk';
import axios from 'axios';
import { ethers } from 'ethers';
// @ts-expect-error
import abi from 'human-standard-token-abi';
// @ts-expect-error
import nftabi from 'non-fungible-token-abi';
import { WalletStoreType } from '@holium/realm-wallet/src/wallet.model';

export class EthereumProtocol implements BaseProtocol {
  private network: 'mainnet' | 'gorli';
  private ethProvider?: ethers.providers.JsonRpcProvider;
  private alchemy: Alchemy;

  constructor(network: 'mainnet' | 'gorli') {
    this.network = network;
    let alchemySettings;
    if (network === 'mainnet') {
      // this.ethProvider = new ethers.providers.JsonRpcProvider(
      //   'https://mainnet.infura.io/v3/4b0d979693764f9abd2e04cd197062da'
      // );
      alchemySettings = {
        apiKey: 'gaAFkc10EtqPwZDCXAvMni8xgz9JnNmM', // Replace with your Alchemy API Key.
        network: Network.ETH_MAINNET, // Replace with your network.
      };
      // etherscan
    } else {
      this.ethProvider = new ethers.providers.JsonRpcProvider(
        'https://eth-goerli.g.alchemy.com/v2/-_e_mFsxIOs5-mCgqZhgb-_FYZFUKmzw'
      );
      alchemySettings = {
        apiKey: 'gaAFkc10EtqPwZDCXAvMni8xgz9JnNmM', // Replace with your Alchemy API Key.
        network: Network.ETH_GOERLI, // Replace with your network.
      };
    }
    this.ethProvider?.removeAllListeners();
    // TODO this is where the apis are querying too much
    // this.ethProvider?.on('block', () => this.updateEthereumInfo());
    this.alchemy = new Alchemy(alchemySettings);
  }

  onBlock(callback: () => void) {
    this.ethProvider!.on('block', callback);
  }

  removeListener() {
    this.ethProvider!.removeAllListeners();
  }

  updateWalletState(walletState: WalletStoreType) {

  }

  async getAccountBalance(addr: string): Promise<number> {
    return await (await this.ethProvider!.getBalance(addr)).toNumber();
  }
  async getAccountTransactions(addr: string): Promise<any[]> {
    const startBlock = 0;
    const apiKey = 'EMD9R77ARFM6AYV2NMBTUQX4I5TM5W169G';
    const goerliURL = `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${addr}&startblock=${startBlock}&sort=asc&apikey=${apiKey}`;
    const mainnetURL = `https://api.etherscan.io/api?module=account&action=txlist&address=${addr}&startblock=${startBlock}&sort=asc&apikey=${apiKey}`;
    const URL = this.network === 'mainnet' ? mainnetURL : goerliURL;
    return await axios.get(URL);
  }
  getAccountAssets(addr: string): Promise<BaseAsset[]> {
    throw new Error('Method not implemented.');
  }
  async sendTransaction(signedTx: string): Promise<any> {
    return (await this.ethProvider!.sendTransaction(signedTx)).hash;
  }
  getAsset(contract: string, addr: string): Asset {
    throw new Error('Method not implemented.');
  }
  async getAssetBalance(contract: string, addr: string): Promise<number> {
    const ethContract = new ethers.Contract(contract, abi, this.ethProvider);
    return (await ethContract.balanceOf(addr)).toString();
  }
  getAssetMetadata(contract: string, addr: string): Promise<Asset> {
    throw new Error('Method not implemented.');
  }
  getAssetAllowance(contract: string, addr: string): Promise<number> {
    const ethContract = new ethers.Contract(contract, abi, this.ethProvider!);
    throw new Error('Method not implemented.');
  }
  getAssetTransfers(contract: string, addr: string): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
  async transferAsset(
    contract: string,
    toAddr: string,
    amountOrTokenId: string | number
  ): Promise<void> {
    const ethContract = new ethers.Contract(contract, abi, this.ethProvider!);
    /*const ethAmount = ethers.utils.parseEther(amount);
    const erc20Amount = ethers.utils.parseUnits(
      amount,
      this.state!.ethereum.wallets.get(walletIndex)!.coins.get(contractAddress)!
        .decimals
    );*/
    return (await ethContract.transfer(toAddr, amountOrTokenId)).hash;
  }
  getFeePrice(): number | Promise<number> {
    throw new Error('Method not implemented.');
  }
  getFeeEstimate(
    from: string,
    to: string,
    value: number
  ): number | Promise<number> {
    throw new Error('Method not implemented.');
  }

}
