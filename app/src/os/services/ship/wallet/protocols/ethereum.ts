import {
  Alchemy,
  AlchemySettings,
  AssetTransfersCategory,
  Network,
} from 'alchemy-sdk';
import axios from 'axios';
import { ethers } from 'ethers';
// @ts-expect-error
import abi from 'human-standard-token-abi';
// NOTE: this was needed for JsonRpcProvider to work
import fetch from 'node-fetch';
import io from 'socket.io-client';

import { WalletDB } from '../wallet.db';
// import nftabi from 'non-fungible-token-abi';
import {
  Asset,
  ChainType,
  CoinAsset,
  NetworkType,
  NFTAsset,
} from '../wallet.types';
import { BaseBlockProtocol } from './BaseBlockProtocol';

declare var global: any;
global.fetch = fetch;

export class EthereumProtocol implements BaseBlockProtocol {
  private protocol: NetworkType;
  private ethProvider: ethers.providers.JsonRpcProvider;
  private alchemy: Alchemy;
  private interval: any;
  private baseURL: string;
  private nodeURL: string;
  private updating: boolean = false;

  constructor(protocol: NetworkType) {
    this.protocol = protocol;
    this.baseURL = `https://realm-api-staging-2-ugw49.ondigitalocean.app`; // staging URL
    if (process.env.NODE_ENV === 'production') {
      this.baseURL = 'https://realm-api-prod-fqotc.ondigitalocean.app';
    } else if (process.env.USE_LOCAL_API) {
      this.baseURL = 'http://localhost:8080';
    }
    // this.baseURL = 'https://api.holium.live/v1/alchemy';
    // if (process.env.NODE_ENV === 'production') {
    //   this.baseURL = 'https://api.holium.live/v1/alchemy';
    // } else if (process.env.NODE_ENV === 'staging') {
    //   this.baseURL = 'https://api.holium.live/v1/alchemy'; // staging URL
    // } else {
    //   this.baseURL = 'http://localhost:3300/v1/alchemy';
    // }
    if (this.protocol === NetworkType.ETH_MAIN) {
      this.nodeURL = this.baseURL + '/eth';
    } else {
      this.nodeURL = this.baseURL + '/gorli';
    }
    let alchemySettings: AlchemySettings;
    this.ethProvider = new ethers.providers.JsonRpcProvider({
      url: this.nodeURL,
    });
    if (this.protocol === NetworkType.ETH_MAIN) {
      alchemySettings = {
        url: this.nodeURL,
        network: Network.ETH_MAINNET,
      };
      // etherscan
    } else {
      alchemySettings = {
        url: this.nodeURL,
        network: Network.ETH_GOERLI,
      };
    }
    this.ethProvider.removeAllListeners();
    this.alchemy = new Alchemy(alchemySettings);
  }

  removeListener() {
    this.ethProvider.removeAllListeners();
    clearInterval(this.interval);
    this.interval = null;
  }

  watchUpdates(conduit: any, walletDB: WalletDB) {
    this.updateWalletState(conduit, walletDB);
    try {
      const socket = io(this.baseURL);
      socket.on('connect', () => {
        const room = this.protocol === NetworkType.ETH_MAIN ? 'main' : 'gorli';
        console.log('connected to ' + room + ' socket');
        socket.emit('join', room);
      });
      socket.on('block', (data: any) => {
        const currentBlock = Number(data.toString());
        this.updateWalletState(conduit, walletDB, currentBlock);
      });
      socket.on('error', (error: any) => {
        console.log(error);
      });
      // either by directly modifying the `auth` attribute
      socket.on('connect_error', () => {
        console.log('connect error');
      });

      socket.on('disconnect', () => {});
    } catch (error) {
      console.log(error);
    }
  }

  async updateWalletState(
    _conduit: any,
    walletDB: WalletDB,
    currentBlock?: number
  ) {
    if (this.updating) {
      return;
    }
    this.updating = true;
    try {
      if (!currentBlock) {
        currentBlock = await this.getBlockNumber();
      }
      const wallets = walletDB.getWallets();
      for (const wallet of wallets) {
        const walletAddress = wallet?.address;
        if (!walletAddress) {
          continue;
        }
        this.getAccountBalance(walletAddress).then((balance: string) => {
          if (balance !== '-1') {
            walletDB.sendChainUpdate({
              'set-balance': {
                index: wallet.wallet_index,
                protocol: this.protocol,
                balance,
              },
            });
            walletDB.setBalance(
              'ethereum',
              this.protocol,
              wallet.wallet_index,
              balance
            );
          }
        });
        this.getAccountTransactions(
          walletAddress,
          walletDB.getLatestBlock(
            ChainType.ETHEREUM,
            this.protocol,
            wallet.wallet_index,
            'eth'
          ) ?? 0,
          currentBlock
        ).then((response: any[]) => {
          if (response.length > 0) {
            walletDB.sendChainUpdate({
              'apply-chain-transactions': {
                protocol: this.protocol,
                index: wallet.wallet_index,
                address: wallet.address,
                transactions: response,
              },
            });
            if (currentBlock) {
              walletDB.sendChainUpdate({
                'set-block': {
                  index: wallet.wallet_index,
                  protocol: this.protocol,
                  block: currentBlock,
                },
              });
              walletDB.setLatestBlock(
                ChainType.ETHEREUM,
                this.protocol,
                wallet.wallet_index,
                'eth',
                currentBlock
              );
            }
          }
        });
        if (true) {
          const ethWalletAddress = wallet?.address;
          if (!ethWalletAddress) {
            continue;
          }
          this.getAccountAssets(ethWalletAddress).then((assets: Asset[]) => {
            for (const asset of assets) {
              if (asset.type === 'coin') {
                this.getAsset(asset.addr, ethWalletAddress, 'coin').then(
                  (coin: Asset | null) => {
                    if (coin) {
                      walletDB.sendChainUpdate({
                        'set-coin': {
                          index: wallet.wallet_index,
                          protocol: this.protocol,
                          coin,
                        },
                      });
                    }
                  }
                );

                if (currentBlock) {
                  this.getAssetTransfers(
                    asset.addr,
                    ethWalletAddress,
                    walletDB.getLatestBlock(
                      ChainType.ETHEREUM,
                      this.protocol,
                      wallet.wallet_index,
                      asset.addr
                    ) ?? 0,
                    currentBlock
                  ).then((transfers: any) => {
                    walletDB.sendChainUpdate({
                      'apply-coin-transactions': {
                        index: wallet.wallet_index,
                        protocol: this.protocol,
                        coinAddr: asset.addr,
                        transactions: transfers,
                      },
                    });
                    if (currentBlock) {
                      walletDB.sendChainUpdate({
                        'set-coin-block': {
                          index: wallet.wallet_index,
                          protocol: this.protocol,
                          coinAddr: asset.addr,
                          block: currentBlock,
                        },
                      });
                      walletDB.setLatestBlock(
                        ChainType.ETHEREUM,
                        this.protocol,
                        wallet.wallet_index,
                        asset.addr,
                        currentBlock
                      );
                    }
                  });
                }
              }
              if (asset.type === 'nft') {
                this.getAsset(
                  asset.addr,
                  ethWalletAddress,
                  'nft',
                  (asset.data as NFTAsset).tokenId
                ).then((nft: Asset | null) => {
                  if (nft) {
                    walletDB.sendChainUpdate({
                      'update-nft': {
                        index: wallet.wallet_index,
                        protocol: this.protocol,
                        nft,
                      },
                    });
                  }
                });
                this.getAssetTransfers(
                  asset.addr,
                  wallet.address,
                  0,
                  currentBlock ?? 0
                ).then((transfers: any) => {
                  walletDB.sendChainUpdate({
                    'update-nft-transfers': {
                      index: wallet.wallet_index,
                      protocol: this.protocol,
                      transfers,
                    },
                  });
                });
              }
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
      this.updating = false;
    }
    this.updating = false;
  }
  async getAccountBalance(addr: string): Promise<string> {
    try {
      return ethers.utils.formatEther(await this.ethProvider.getBalance(addr));
    } catch (error) {
      console.log('getAccountBalance error');
      console.error(error);
      return '-1';
    }
  }
  async getAccountTransactions(
    addr: string,
    fromBlock: number,
    toBlock: number
  ): Promise<any[]> {
    try {
      let fromTransfers: any;
      let retries = 3;
      for (let i = 0; i < retries; i++) {
        try {
          fromTransfers = await axios.request({
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
          break;
        } catch (error) {
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } else {
            throw error;
          }
        }
      }
      const from = fromTransfers.data.result.transfers;
      let toTransfers: any;
      retries = 3;
      for (let i = 0; i < retries; i++) {
        try {
          toTransfers = await axios.request({
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
          break;
        } catch (error) {
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } else {
            throw error;
          }
        }
      }
      const to = toTransfers.data.result.transfers;
      return from.concat(to);
    } catch {
      return [];
    }
  }
  async getAccountAssets(addr: string): Promise<Asset[]> {
    try {
      const coins = await this.alchemy.core.getTokenBalances(addr);
      const nfts = await this.alchemy.nft.getNftsForOwner(addr);
      const assets: Asset[] = [];
      const data: NFTAsset = {
        name: '',
        tokenId: '',
        description: '',
        image: '',
        transferable: true,
        properties: {},
      };
      for (const coin of coins.tokenBalances) {
        assets.push({
          addr: coin.contractAddress,
          type: 'coin',
          data,
        });
      }
      for (const nft of nfts.ownedNfts) {
        data.tokenId = nft.tokenId;
        assets.push({
          addr: nft.contract.address,
          type: 'nft',
          data,
        });
      }
      return assets;
    } catch (error: any) {
      return [];
    }
  }
  async sendTransaction(signedTx: string): Promise<any> {
    return (await this.ethProvider.sendTransaction(signedTx)).hash;
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
  ): Promise<Asset | null> {
    try {
      if (type === 'coin') {
        const metadata = await this.alchemy.core.getTokenMetadata(contract);
        const ethContract = new ethers.Contract(
          contract,
          abi,
          this.ethProvider
        );
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
          ethers.BigNumber.from(tokenId)
        );
        const data: NFTAsset = {
          name: nft.title,
          description: nft.description,
          image: nft.rawMetadata?.image || '',
          tokenId: tokenId ?? '',
          transferable: true,
          properties: {},
        };
        return {
          addr: contract,
          type: 'nft',
          data,
        };
      }
    } catch (error) {
      return null;
    }
  }
  async getAssetTransfers(
    contract: string,
    addr: string,
    fromBlock: number,
    toBlock: number
  ): Promise<any[]> {
    try {
      let fromTransfers: any;
      let retries = 3;
      for (let i = 0; i < retries; i++) {
        try {
          fromTransfers = await axios.request({
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
          break;
        } catch (error) {
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } else {
            throw error;
          }
        }
      }
      const from = fromTransfers.data.result.transfers;
      let toTransfers: any;
      retries = 3;
      for (let i = 0; i < retries; i++) {
        try {
          toTransfers = await axios.request({
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
          break;
        } catch (error) {
          if (i < retries - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } else {
            throw error;
          }
        }
      }
      const to = toTransfers.data.result.transfers;
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
    const ethContract = new ethers.Contract(contract, abi, this.ethProvider);
    return (await ethContract.transfer(toAddr, amountOrTokenId)).hash;
  }

  async getFeePrice(): Promise<any> {
    return await this.ethProvider.getGasPrice();
  }

  async getFeeEstimate(tx: any): Promise<any> {
    return await this.alchemy.core.estimateGas(tx);
  }

  async getNonce(address: string) {
    //return '0x' + (await this.alchemy.core.getTransactionCount(address) + 1).toString(16);
    return await this.ethProvider.getTransactionCount(address);
  }

  async getChainId() {
    return (await this.ethProvider.getNetwork()).chainId;
  }

  async getBlockNumber(): Promise<number> {
    return await this.ethProvider.getBlockNumber();
  }
}
