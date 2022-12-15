import { BaseProtocol } from '../../wallet-lib/wallets/BaseProtocol';
import {
  Alchemy,
  AlchemySettings,
  AssetTransfersCategory,
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
} from '../../wallet-lib/wallet.model';
import { ethers } from 'ethers';
import { TransactionDescription } from 'ethers/lib/utils';

export class EthereumProtocol implements BaseProtocol {
  private protocol: ProtocolType;
  private ethProvider: ethers.providers.JsonRpcProvider;
  private alchemy: Alchemy;
  private interval: any;
  private baseURL: string;
  private nodeURL: string;
  private blockURL: string;

  constructor(protocol: ProtocolType) {
    this.protocol = protocol;
    this.baseURL = `https://realm-api-staging-2-ugw49.ondigitalocean.app`; // staging URL
    if (process.env.NODE_ENV === 'production') {
      this.baseURL = 'https://realm-api-prod-fqotc.ondigitalocean.app';
    } else if (process.env.USE_LOCAL_API) {
      this.baseURL = 'http://localhost:8080';
    }
    if (this.protocol === ProtocolType.ETH_MAIN) {
      this.nodeURL = this.baseURL + '/eth';
      this.blockURL = this.baseURL + '/block';
    } else {
      this.nodeURL = this.baseURL + '/gorli';
      this.blockURL = this.baseURL + '/gorliblock';
    }
    let alchemySettings: AlchemySettings;
    if (this.protocol === ProtocolType.ETH_MAIN) {
      this.ethProvider = new ethers.providers.JsonRpcProvider(this.nodeURL);
      alchemySettings = {
        url: this.nodeURL,
        network: Network.ETH_MAINNET,
      };
      // etherscan
    } else {
      this.ethProvider = new ethers.providers.JsonRpcProvider(this.nodeURL);
      alchemySettings = {
        url: this.nodeURL,
        network: Network.ETH_GOERLI,
      };
    }
    this.ethProvider!.removeAllListeners();
    this.alchemy = new Alchemy(alchemySettings);
  }

  removeListener() {
    this.ethProvider!.removeAllListeners();
    clearInterval(this.interval);
    this.interval = null;
  }

  watchUpdates(conduit: any, walletStore: WalletStoreType) {
    // this.updateWalletState(conduit, walletStore);
    console.log('watching for blocks')
    const config = {
      headers:{
        Accept: 'text/event-stream'
      }
    };
    axios.get(this.blockURL, {
      responseType: 'stream'
    }).then((res: any) => {
      res.data.on('data', (data: any) => {
        const currentBlock = Number(data.toString());
        this.updateWalletState(conduit, walletStore, currentBlock);
        if (
          !(this.protocol === ProtocolType.ETH_GORLI) &&
          !(this.protocol === ProtocolType.UQBAR)
        ) {
          walletStore.currentStore.setBlock(currentBlock);
        }
      });
    });
  }

  async updateWalletState(conduit: any, walletStore: WalletStoreType, currentBlock: number) {
    for (const walletKey of walletStore.currentStore?.wallets.keys()) {
      const wallet = walletStore.currentStore.wallets.get(walletKey)!;
      this.getAccountBalance(wallet.address).then((balance: string) =>
        wallet.setBalance(this.protocol, balance)
      );
      this.getAccountTransactions(
        wallet.address,
        walletStore.currentStore.block,
        currentBlock
      ).then((response: any[]) => {
        if (response.length > 0) {
          wallet.applyTransactions(conduit, this.protocol, response);
          walletStore.currentStore.setBlock(currentBlock);
        }
      });
      if (walletStore.navState.networkStore === NetworkStoreType.ETHEREUM) {
        const ethWallet = walletStore.ethereum.wallets.get(walletKey)!;
        this.getAccountAssets(ethWallet.address).then((assets: Asset[]) => {
          for (let asset of assets) {
            if (asset.type === 'coin') {
              this.getAsset(asset.addr, ethWallet.address, 'coin').then(
                (coin: Asset) => ethWallet.updateCoin(this.protocol, coin)
              );
              this.getAssetTransfers(asset.addr, ethWallet.address, ethWallet.data.get(this.protocol)!.coins.get(asset.addr)!.block, currentBlock).then(
                (transfers: any) => {
                  if (ethWallet.data.get(this.protocol)!.coins.has(asset.addr) && transfers.length > 0) {
                    ethWallet.data
                      .get(this.protocol)!
                      .coins.get(asset.addr)!
                      .applyERC20Transactions(ethWallet.index, transfers);
                  }
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
    fromBlock: number,
    toBlock: number,
  ): Promise<any[]> {
    try {
      const fromTransfers = await axios.request({
        method: 'POST',
        url: this.nodeURL,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        data: {
          method: 'alchemy_getAssetTransfers',
          params: [
            {
              fromBlock: ethers.utils.hexlify(fromBlock),
              toBlock: ethers.utils.hexlify(toBlock),
              fromAddress: addr,
              category: [
                AssetTransfersCategory.INTERNAL,
                AssetTransfersCategory.EXTERNAL,
              ],
              withMetadata: true,
            },
          ],
        },
      });
      const from = fromTransfers.data.result.transfers;
      const toTransfers = await axios.request({
        method: 'POST',
        url: this.nodeURL,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        data: {
          method: 'alchemy_getAssetTransfers',
          params: [
            {
              fromBlock: ethers.utils.hexlify(fromBlock),
              toBlock: ethers.utils.hexlify(toBlock),
              toAddress: addr,
              category: [
                AssetTransfersCategory.INTERNAL,
                AssetTransfersCategory.EXTERNAL,
              ],
              withMetadata: true,
            },
          ],
        },
      });
      const to = toTransfers.data.result.transfers;
      return from.concat(to);
    } catch {
      return [];
    }
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
  async populateERC20(
    contractAddress: string,
    toAddress: string,
    amount: string,
    decimals: number
  ) {
    const contract = new ethers.Contract(
      contractAddress,
      abi,
      this.ethProvider
    );
    const erc20Amount = ethers.utils.parseUnits(amount, decimals);
    return await contract.populateTransaction.transfer(toAddress, erc20Amount);
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
    fromBlock: number,
    toBlock: number,
  ): Promise<any[]> {
    let from: any[] = [];
    try {
      const fromTransfers = await axios.request({
        method: 'POST',
        url: this.nodeURL,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        data: {
          method: 'alchemy_getAssetTransfers',
          params: [
            {
              fromBlock: ethers.utils.hexlify(fromBlock),
              toBlock: ethers.utils.hexlify(toBlock),
              fromAddress: addr,
              contractAddresses: [contract],
              category: [
                AssetTransfersCategory.ERC20,
                AssetTransfersCategory.ERC721,
                AssetTransfersCategory.ERC1155,
              ],
              withMetadata: true,
            },
          ],
        },
      });
      from = fromTransfers.data.result.transfers;
      let to: any[] = [];
      const toTransfers = await axios.request({
        method: 'POST',
        url: this.nodeURL,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        data: {
          method: 'alchemy_getAssetTransfers',
          params: [
            {
              fromBlock: ethers.utils.hexlify(fromBlock),
              toBlock: ethers.utils.hexlify(toBlock),
              fromAddress: addr,
              contractAddresses: [contract],
              category: [
                AssetTransfersCategory.ERC20,
                AssetTransfersCategory.ERC721,
                AssetTransfersCategory.ERC1155,
              ],
              withMetadata: true,
            },
          ],
        },
      });
      to = toTransfers.data.result.transfers;
      return from.concat(to);
    } catch {
      return [];
    }
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
