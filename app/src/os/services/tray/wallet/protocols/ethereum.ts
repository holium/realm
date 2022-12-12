import { BaseProtocol } from '@holium/realm-wallet/src/wallets/BaseProtocol';
import {
  Alchemy,
  AlchemySettings,
  AssetTransfersCategory,
  AssetTransfersWithMetadataParams,
  Network,
} from 'alchemy-sdk';
import axios from 'axios';
// @ts-expect-error
import abi from 'human-standard-token-abi';
// @ts-expect-error
import nftabi from 'non-fungible-token-abi';
import {
  ProtocolType,
  WalletStoreType,
  Asset,
  CoinAsset,
  NFTAsset,
  NetworkStoreType,
} from '../../wallet-lib';
import { ethers } from 'ethers';
import EventSource from 'eventsource';

export class EthereumProtocol implements BaseProtocol {
  private protocol: ProtocolType;
  private ethProvider: ethers.providers.JsonRpcProvider;
  private alchemy: Alchemy;
  private interval: any;

  constructor(protocol: ProtocolType) {
    this.protocol = protocol;
    let baseURL = `https://realm-api-staging-2-ugw49.ondigitalocean.app`; // staging URL
    if (process.env.NODE_ENV === 'production') {
      baseURL = 'https://realm-api-prod-fqotc.ondigitalocean.app';
    } else if (process.env.USE_LOCAL_API) {
      baseURL = 'http://localhost:8080';
    }
    let alchemySettings: AlchemySettings;
    if (protocol === ProtocolType.ETH_MAIN) {
      this.ethProvider = new ethers.providers.JsonRpcProvider(baseURL + '/eth');
      alchemySettings = {
        url: baseURL + '/eth',
        network: Network.ETH_MAINNET,
      };
      // etherscan
    } else {
      this.ethProvider = new ethers.providers.JsonRpcProvider(
        baseURL + '/gorli'
      );
      alchemySettings = {
        url: baseURL + '/gorli',
        network: Network.ETH_GOERLI,
      };
    }
    this.ethProvider!.removeAllListeners();
    this.alchemy = new Alchemy(alchemySettings);
    this.getAssetTransfers(
      '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      '0x9DbF0b968C395c09b78c9De2c9e486879B1a0089',
      0
    );
  }

  removeListener() {
    this.ethProvider!.removeAllListeners();
    clearInterval(this.interval);
    this.interval = null;
  }

  watchUpdates(walletStore: WalletStoreType) {
    this.updateWalletState(walletStore);
    this.interval = setInterval(async () => {
      await this.updateWalletState(walletStore);
      if (
        !(walletStore.navState.protocol === ProtocolType.ETH_GORLI) &&
        !(walletStore.navState.protocol === ProtocolType.UQBAR)
      ) {
        walletStore.currentStore.setBlock(await this.getBlockNumber());
      }
    }, 30000);
  }

  async updateWalletState(walletStore: WalletStoreType) {
    for (let walletKey of walletStore.currentStore.wallets.keys()) {
      const wallet = walletStore.currentStore.wallets.get(walletKey)!;
      this.getAccountBalance(wallet.address).then((balance: string) =>
        wallet.setBalance(this.protocol, balance)
      );
      this.getAccountTransactions(
        wallet.address,
        walletStore.currentStore.block
      ).then((response: any) => {
        wallet.applyTransactions(this.protocol, response);
      });
      if (walletStore.navState.networkStore === NetworkStoreType.ETHEREUM) {
        const ethWallet = walletStore.ethereum.wallets.get(walletKey)!;
        this.getAccountAssets(ethWallet.address).then((assets: Asset[]) => {
          for (let asset of assets) {
            if (asset.type === 'coin') {
              this.getAsset(asset.addr, ethWallet.address, 'coin').then(
                (coin: Asset) => ethWallet.updateCoin(this.protocol, coin)
              );
              this.getAssetTransfers(asset.addr, ethWallet.address, 0).then(
                (transfers: any) => {
                  ethWallet.updateCoinTransfers(
                    this.protocol,
                    asset.addr,
                    transfers
                  );
                }
              );
            }
            if (asset.type === 'nft') {
              this.getAsset(
                asset.addr,
                ethWallet.address,
                'nft',
                (asset.data as NFTAsset).tokenId
              ).then((nft: Asset) => ethWallet.updateNft(this.protocol, nft));
              /*this.getAssetTransfers(asset.addr, ethWallet.address, 0).then(
                ethWallet.updateNftTransfers
              );*/
            }
          }
        });
      }
    }
  }
  async getAccountBalance(addr: string): Promise<string> {
    return ethers.utils.formatEther(await this.ethProvider!.getBalance(addr));
  }
  async getAccountTransactions(
    addr: string,
    startBlock: number
  ): Promise<any[]> {
    // try {
    const from = (
      await this.alchemy.core.getAssetTransfers({
        fromBlock: ethers.utils.hexlify(0),
        fromAddress: addr,
        category: [
          AssetTransfersCategory.INTERNAL,
          AssetTransfersCategory.EXTERNAL,
        ],
        withMetadata: true,
      })
    ).transfers;
    const to = (
      await this.alchemy.core.getAssetTransfers({
        fromBlock: ethers.utils.hexlify(0),
        toAddress: addr,
        category: [
          AssetTransfersCategory.INTERNAL,
          AssetTransfersCategory.EXTERNAL,
        ],
        withMetadata: true,
      })
    ).transfers;
    return from.concat(to);
    // } catch (e) {
    //   // console.log(e);
    //   return [];
    // }
    /*txns.forEach(async (txn, index) => {
      txns[index] = {
        timeStamp: await this.getBlockTime(Number(txn.blockNum)),
        ...txn
      }
    })
    for (let txn of txns) {
      console.log(txn.timeStamp)
    }*/
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
      properties: {},
    };
    for (let coin of coins.tokenBalances) {
      assets.push({
        addr: coin.contractAddress,
        type: 'coin',
        data,
      });
    }
    for (let nft of nfts.ownedNfts) {
      data.tokenId = nft.tokenId;
      assets.push({
        addr: nft.contract.address,
        type: 'nft',
        data,
      });
    }
    return assets;
  }
  async sendTransaction(signedTx: string): Promise<any> {
    return (await this.ethProvider!.sendTransaction(signedTx)).hash;
  }
  async getAsset(
    contract: string,
    addr: string,
    type: string,
    tokenId?: string
  ): Promise<Asset> {
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
      };
      return {
        addr: contract,
        type,
        data,
      };
    } else {
      const nft = await this.alchemy.nft.getNftMetadata(
        contract,
        ethers.BigNumber.from(tokenId!)
      );
      const data: NFTAsset = {
        name: nft.title,
        description: nft.description,
        image: nft.rawMetadata?.image || '',
        tokenId: tokenId!,
        transferable: true,
        properties: {},
      };
      return {
        addr: contract,
        type: 'nft',
        data,
      };
    }
  }
  async getAssetTransfers(
    contract: string,
    addr: string,
    startBlock: number
  ): Promise<any[]> {
    const fromTransfers = await axios.request({
      method: 'POST',
      url: 'https://realm-api-staging-2-ugw49.ondigitalocean.app/gorli',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      data: {
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            fromBlock: ethers.utils.hexlify(0),
            toBlock: 'latest',
            fromAddress: addr,
            contractAddresses: [contract],
            category: ['erc20', 'erc721', 'erc1155'],
            withMetadata: true,
          },
        ],
      },
    });
    const from = fromTransfers.data.result.transfers;
    const toTransfers = await axios.request({
      method: 'POST',
      url: 'https://realm-api-staging-2-ugw49.ondigitalocean.app/gorli',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      data: {
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            fromBlock: ethers.utils.hexlify(0),
            toBlock: 'latest',
            toAddress: addr,
            category: [
              AssetTransfersCategory.ERC20,
              AssetTransfersCategory.ERC721,
              AssetTransfersCategory.ERC1155,
            ],
            contractAddresses: [contract],
            withMetadata: true,
          },
        ],
      },
    });

    const to = toTransfers.data.result.transfers;
    const merged = from.concat(to);
    return merged;
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
    return await this.ethProvider!.getGasPrice();
  }

  async getFeeEstimate(from: string, to: string, value: string): Promise<any> {
    return await this.alchemy.core.estimateGas({
      to,
      from,
      value: ethers.utils.parseEther(value),
    });
  }

  async getNonce(address: string) {
    //return '0x' + (await this.alchemy.core.getTransactionCount(address) + 1).toString(16);
    return await this.ethProvider.getTransactionCount(address);
  }

  async getChainId() {
    return (await this.ethProvider!.getNetwork()).chainId;
  }

  async getBlockNumber(): Promise<number> {
    return await this.ethProvider.getBlockNumber();
  }
}
