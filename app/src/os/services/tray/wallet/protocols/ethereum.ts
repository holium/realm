import {
  BaseProtocol,
} from '@holium/realm-wallet/src/wallets/BaseProtocol';
import { BaseAsset } from '@holium/realm-wallet/src/wallets/BaseAsset';
import { Alchemy, Network } from 'alchemy-sdk';
import axios from 'axios';
import { ethers } from 'ethers';
// @ts-expect-error
import abi from 'human-standard-token-abi';
// @ts-expect-error
import nftabi from 'non-fungible-token-abi';
import { ProtocolType, WalletStoreType, Asset } from '@holium/realm-wallet/src/wallet.model';
import { parseEther } from 'ethers/lib/utils';

export class EthereumProtocol implements BaseProtocol {
  private network: ProtocolType;
  private ethProvider: ethers.providers.JsonRpcProvider;
  private alchemy: Alchemy;

  constructor(network: ProtocolType) {
    this.network = network;
    let alchemySettings;
    if (network === ProtocolType.ETH_MAIN) {
      this.ethProvider = new ethers.providers.JsonRpcProvider(
        'https://eth.g.alchemy.com/v2/-_e_mFsxIOs5-mCgqZhgb-_FYZFUKmzw'
      );
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
    this.ethProvider!.removeAllListeners();
    this.alchemy = new Alchemy(alchemySettings);
  }

  removeListener() {
    this.ethProvider!.removeAllListeners();
  }

  watchUpdates(walletStore: WalletStoreType) {
    this.updateWalletState(walletStore);
/*    this.ethProvider!.on('block', (block: number) => {
      this.updateWalletState(walletStore);

      if (!(walletStore.navState.protocol === ProtocolType.ETH_GORLI)
      && !(walletStore.navState.protocol === ProtocolType.UQBAR)) {
        walletStore.currentStore.setBlock(block);
      }
    });*/
  }

  updateWalletState(walletStore: WalletStoreType) {
    for (let wallet of walletStore.ethereum.wallets.keys()) {
      const ethWallet = walletStore.ethereum.wallets.get(wallet)!;
      this.getAccountBalance(ethWallet.address).then(ethWallet.setBalance);
      this.getAccountTransactions(ethWallet.address, walletStore.ethereum.block)
        .then((response: any) => {
          ethWallet.applyTransactions(this.network, response.data.result)
        })
      this.getAccountAssets(ethWallet.address).then();
    }
  }

  async getAccountBalance(addr: string): Promise<string> {
    return (await this.ethProvider!.getBalance(addr)).toString();
  }
  async getAccountTransactions(addr: string, startBlock: number): Promise<any[]> {
    const apiKey = 'EMD9R77ARFM6AYV2NMBTUQX4I5TM5W169G';
    const goerliURL = `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${addr}&startblock=${startBlock}&sort=asc&apikey=${apiKey}`;
    const mainnetURL = `https://api.etherscan.io/api?module=account&action=txlist&address=${addr}&startblock=${startBlock}&sort=asc&apikey=${apiKey}`;
    const URL = this.network === ProtocolType.ETH_MAIN ? mainnetURL : goerliURL;
    return await axios.get(URL);
  }
  async getAccountAssets(addr: string): Promise<Asset[] | undefined> {
    console.log('getting account assets')
    const metadata = await this.alchemy.core.getTokenMetadata(addr)
    console.log(metadata);
    return undefined;
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
  getAssetTransfers(contract: string, addr: string, startBlock: number): Promise<any[]> {
    this.alchemy.core.getAssetTransfers({
      fromBlock: ethers.utils.hexlify(startBlock),
      fromAddress: addr,
      excludeZeroValue: true,
      category: []//["erc721", "erc1155"],
    })
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
    return 0;
  }
  async getFeeEstimate(
    from: string,
    to: string,
    value: number
  ): Promise<number> {
    return (await this.alchemy.core.estimateGas({
      to,
      from,
      value
    })).toNumber();
  }
}
