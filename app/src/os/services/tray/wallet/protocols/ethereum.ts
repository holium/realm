import {
  BaseProtocol,
} from '@holium/realm-wallet/src/wallets/BaseProtocol';
import { Alchemy, AssetTransfersCategory, Network } from 'alchemy-sdk';
import axios from 'axios';
// @ts-expect-error
import abi from 'human-standard-token-abi';
// @ts-expect-error
import nftabi from 'non-fungible-token-abi';
import { ProtocolType, WalletStoreType, Asset, CoinAsset, NFTAsset, NetworkStoreType } from '@holium/realm-wallet/src/wallet.model';
import { ethers } from 'ethers';

export class EthereumProtocol implements BaseProtocol {
  private protocol: ProtocolType;
  private ethProvider: ethers.providers.JsonRpcProvider;
  private alchemy: Alchemy;

  constructor(protocol: ProtocolType) {
    this.protocol = protocol;
    let alchemySettings;
    if (protocol === ProtocolType.ETH_MAIN) {
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

  async updateWalletState(walletStore: WalletStoreType) {
    for (let walletKey of walletStore.currentStore.wallets.keys()) {
      const wallet = walletStore.currentStore.wallets.get(walletKey)!;
      this.getAccountBalance(wallet.address)
        .then((balance: string) => wallet.setBalance(this.protocol, balance));
      this.getAccountTransactions(wallet.address, walletStore.currentStore.block)
        .then((response: any) => {
          wallet.applyTransactions(this.protocol, response.data.result)
        })
      if (walletStore.navState.networkStore === NetworkStoreType.ETHEREUM) {
        const ethWallet = walletStore.ethereum.wallets.get(walletKey)!;
        const assets = await this.getAccountAssets(ethWallet.address);
        for (let asset of assets) {
          if (asset.type === 'coin') {
            this.getAsset(asset.addr, ethWallet.address, 'coin')
              .then((coin: Asset) => ethWallet.updateCoin(this.protocol, coin));
            this.getAssetTransfers(asset.addr, ethWallet.address, 0).then(ethWallet.updateCoinTransfers)
          }
          if (asset.type === 'nft') {
            this.getAsset(asset.addr, ethWallet.address, 'nft', (asset.data as NFTAsset).tokenId)
              .then((nft: Asset) => ethWallet.updateNft(this.protocol, nft));
            this.getAssetTransfers(asset.addr, ethWallet.address, 0).then(ethWallet.updateNftTransfers);
          }
        }
      }
    }
  }
  async getAccountBalance(addr: string): Promise<string> {
    return ethers.utils.formatEther(await this.ethProvider!.getBalance(addr));
  }
  async getAccountTransactions(addr: string, startBlock: number): Promise<any[]> {
    const apiKey = 'EMD9R77ARFM6AYV2NMBTUQX4I5TM5W169G';
    const goerliURL = `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${addr}&startblock=${startBlock}&sort=asc&apikey=${apiKey}`;
    const mainnetURL = `https://api.etherscan.io/api?module=account&action=txlist&address=${addr}&startblock=${startBlock}&sort=asc&apikey=${apiKey}`;
    const URL = this.protocol === ProtocolType.ETH_MAIN ? mainnetURL : goerliURL;
    return await axios.get(URL);
  }
  async getAccountAssets(addr: string): Promise<Asset[]> {
    const coins = await this.alchemy.core.getTokenBalances(addr);
    const nfts = await this.alchemy.nft.getNftsForOwner(addr);
    let assets: Asset[] = [];
    let data: NFTAsset = {
      name: '',
      tokenId: '',
      description: '',
      image: '',
      transferable: true,
      properties: {}
    }
    for (let coin of coins.tokenBalances) {
      assets.push({
        addr: coin.contractAddress,
        type: 'coin',
        data,
      })
    }
    for (let nft of nfts.ownedNfts) {
      data.tokenId = nft.tokenId;
      assets.push({
        addr: nft.contract.address,
        type: 'nft',
        data,
      })
    }
    return assets
  }
  async sendTransaction(signedTx: string): Promise<any> {
    return (await this.ethProvider!.sendTransaction(signedTx)).hash;
  }
  async getAsset(contract: string, addr: string, type: string, tokenId?: string): Promise<Asset> {
    if (type === 'coin') {
      const metadata = await this.alchemy.core.getTokenMetadata(contract);
      const ethContract = new ethers.Contract(contract, abi, this.ethProvider!);
      const balance = (await ethContract.balanceOf(addr)).toString();
      const data: CoinAsset = {
        logo: metadata.logo,
        symbol: metadata.symbol || '',
        decimals: metadata.decimals || 0,
        balance,
        totalSupply: 1,
        allowances: {},
      }
      return {
        addr: contract,
        type,
        data
      }
    }
    else {
      const nft = await this.alchemy.nft.getNftMetadata(contract, ethers.BigNumber.from(tokenId!));
      const data: NFTAsset = {
        name: nft.title,
        description: nft.description,
        image: nft.rawMetadata?.image || '',
        tokenId: tokenId!,
        transferable: true,
        properties: {},
      }
      return {
        addr: contract,
        type: 'nft',
        data
      }
    }
  }
  async getAssetTransfers(contract: string, addr: string, startBlock: number): Promise<any[]> {
    return (await this.alchemy.core.getAssetTransfers({
      fromBlock: ethers.utils.hexlify(startBlock),
      fromAddress: addr,
      contractAddresses: [contract],
      excludeZeroValue: true,
      category: [AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155],
    })).transfers;
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

  async getFeePrice(): Promise<any> {
    return (await this.alchemy.core.getFeeData()).gasPrice;
  }

  async getFeeEstimate(
    from: string,
    to: string,
    value: string
  ): Promise<any> {
    return (await this.alchemy.core.estimateGas({
      to,
      from,
      value: ethers.utils.parseEther(value)
    }));
  }

  async getNonce(address: string) {
    return '0x' + (await this.alchemy.core.getTransactionCount(address) + 1).toString(16);
  }
}
