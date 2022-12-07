import {
  BaseProtocol,
} from '@holium/realm-wallet/src/wallets/BaseProtocol';
import { BaseAsset } from '@holium/realm-wallet/src/wallets/BaseAsset';
import { Alchemy, AssetTransfersCategory, Network } from 'alchemy-sdk';
import axios from 'axios';
import { ethers, utils } from 'ethers';
// @ts-expect-error
import abi from 'human-standard-token-abi';
// @ts-expect-error
import nftabi from 'non-fungible-token-abi';
import { ProtocolType, WalletStoreType, Asset, CoinAsset, NFTAsset } from '@holium/realm-wallet/src/wallet.model';

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
      this.getAccountAssets(ethWallet.address).then(console.log);
    }
  }

  async getAccountBalance(addr: string): Promise<string> {
    return utils.formatEther(await this.ethProvider!.getBalance(addr));
  }
  async getAccountTransactions(addr: string, startBlock: number): Promise<any[]> {
    const apiKey = 'EMD9R77ARFM6AYV2NMBTUQX4I5TM5W169G';
    const goerliURL = `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${addr}&startblock=${startBlock}&sort=asc&apikey=${apiKey}`;
    const mainnetURL = `https://api.etherscan.io/api?module=account&action=txlist&address=${addr}&startblock=${startBlock}&sort=asc&apikey=${apiKey}`;
    const URL = this.network === ProtocolType.ETH_MAIN ? mainnetURL : goerliURL;
    return await axios.get(URL);
  }
  async getAccountAssets(addr: string): Promise<Asset[]> {
    const coins = await this.alchemy.core.getTokenBalances(addr);
    const nfts = await this.alchemy.nft.getNftsForOwner(addr);
    let assets: Asset[] = [];
    for (let coin of coins.tokenBalances) {
      console.log('getting account assets')
      const metadata = await this.alchemy.core.getTokenMetadata(coin.contractAddress);
      console.log(metadata);
      console.log(metadata);
      const data: CoinAsset = {
        logo: metadata.logo,
        symbol: metadata.symbol || '',
        decimals: metadata.decimals || 0,
        balance: 1, // coin.tokenBalance?,
        totalSupply: 1,
        allowances: {},
      }
      const asset: Asset = {
        addr: coin.contractAddress,
        type: 'coin',
        data
      }
      assets.push(asset)
    }
    for (let nft of nfts.ownedNfts) {
      const data: NFTAsset = {
        name: nft.title,
        description: nft.description,
        image: nft.rawMetadata?.image || '',
        transferable: true,
        properties: {},
      }
      const asset: Asset = {
        addr: nft.contract.address,
        id: nft.tokenId,
        type: 'nft',
        data
      }
      assets.push(asset);
    }
    return assets
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
  async getAssetMetadata(contract: string): Promise<Asset> {
    console.log('getting account assets')
    const metadata = await this.alchemy.core.getTokenMetadata(contract)
    console.log(metadata);
    let asset: Asset;
    return asset;
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
  async getFeePrice(): Promise<number> {
    return Number((await this.alchemy.core.getFeeData()).gasPrice?._hex.toString());
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
