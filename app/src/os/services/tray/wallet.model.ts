import {
  applySnapshot,
  types,
  Instance,
  getSnapshot,
  flow
} from 'mobx-state-tree';
import { Network, Alchemy, Nft } from "alchemy-sdk";

const alchemySettings = {
  apiKey: "gaAFkc10EtqPwZDCXAvMni8xgz9JnNmM", // Replace with your Alchemy API Key.
  network: Network.ETH_GOERLI, // Replace with your network.
};

const alchemy = new Alchemy(alchemySettings);

export enum WalletView {
  ETH_LIST = 'ethereum:list',
  ETH_NEW = 'ethereum:new',
  WALLET_DETAIL = 'ethereum:detail',
  TRANSACTION_DETAIL = 'ethereum:transaction',
  LOCKED = 'locked',
  ETH_SETTINGS = 'ethereum:settings',
  BIT_SETTINGS = 'bitcoin:settings',
  BIT_LIST = 'bitcoin:list',
  CREATE_WALLET = 'create-wallet'
}

export enum NetworkType {
  ethereum = 'ethereum',
  bitcoin = 'bitcoin'
}

const gweiToEther = (gwei: number) => {
  return gwei / 1000000000000000000;
}

const Settings = types
  .model('Settings', {
    defaultIndex: types.integer,
    provider: types.maybe(types.string),
  })

const BitcoinWallet = types.model('BitcoinWallet', {
  network: types.string,
  path: types.string,
  address: types.string,
  nickname: types.string,
  balance: types.string,
  conversions: types.maybe(
    types.model({
      usd: types.maybe(types.string),
      cad: types.maybe(types.string),
      euro: types.maybe(types.string),
    })
  ),
});

export type BitcoinWalletType = Instance<typeof BitcoinWallet>

const BitcoinStore = types
  .model('BitcoinStore', {
    wallets: types.map(BitcoinWallet),
    settings: Settings,
  })
  .actions((self) => ({
    initial(wallets: any) {
      const btcWallets = wallets.bitcoin;
      Object.entries(btcWallets).forEach(([key, wallet]) => {
        btcWallets[key] = {
          network: 'bitcoin',
          path: (wallet as any).path,
          nickname: (wallet as any).nickname,
          balance: (wallet as any).balance.toString(),
          address: (wallet as any).address,
          contracts: {}
        }
      })
      applySnapshot(self.wallets, btcWallets);
    },
    // pokes
    setProvider(provider: string) {
      self.settings.provider = provider;
    },
    // updates
    applyWalletUpdate(wallet: any) {
      const walletObj = {
        network: 'bitcoin',
        path: wallet.path,
        address: wallet.address,
        nickname: wallet.nickname,
        balance: wallet.balance.toString(),
      };
      self.wallets.set(wallet.key, BitcoinWallet.create(walletObj));
    }
  }));

const ERC20 = types.model('ERC20', {
  name: types.string,
  logo: types.string,
  address: types.string,
  balance: types.string,
  decimals: types.number,
}).actions((self) => ({
  setBalance(balance: string) {
    self.balance = balance
  }
}));

export type ERC20Type = Instance<typeof ERC20>

// const ERC721Token = types
//   .model('ERC721Token', {
//     name: types.string,
//     // collection name - null if single
//     // last price or floor price
//     imageUrl: types.string,
//     tokenId: types.number,
//   })
// const ERC721Token = types
//   .model('ERC721Token', {
//     name: types.string,
//     imageUrl: types.string,
//     tokenId: types.string,
//   })

// const ERC721 = types.model('ERC721', {
//   name: types.string,
//   address: types.string,
//   tokens: types.map(ERC721Token),//types.map(types.number),
// });

const ERC721 = types.model('ERC721', {
  name: types.string,
  collectionName: types.maybe(types.string),
  address: types.string,
  tokenId: types.string,
  imageUrl: types.string,
  lastPrice: types.string,
  floorPrice: types.maybe(types.string)
})

export type ERC721Type = Instance<typeof ERC721>

const EthWallet = types
  .model('EthWallet', {
    network: types.string,
    path: types.string,
    address: types.string,
    balance: types.string,
    coins: types.map(ERC20),
    nfts: types.map(ERC721),
    nickname: types.string,
    conversions: types.maybe(
      types.model({
        usd: types.maybe(types.string),
        cad: types.maybe(types.string),
        euro: types.maybe(types.string),
      })
    ),
  })
  .actions((self) => ({
    addSmartContract(contractType: string, name: string, contractAddress: string, decimals: number) {
      /*if (contractType === 'erc721') {
        *const contract = ERC721.create({
          name: name,
          collectionName: '',
          address: contractAddress,
          tokenId: 0,
          imageUrl: '',
          lastPrice: '',
          floorPrice: '',
        })
        self.nfts.set(contract.address, contract);
      }*/
      if (contractType === 'erc20') {
        const contract = ERC20.create({
          name: name,
          logo: '',
          address: contractAddress,
          balance: '0',
          decimals: decimals
        })
        self.coins.set(contract.address, contract);
      }
    },
    setCoins(coins: any) {
      self.coins.clear();
      for (var coin of coins) {
        this.setCoin(coin.name, coin.logo, coin.contractAddress, coin.balance, coin.decimals)
      }
    },
    setCoin(name: string, imageUrl: string, contractAddress: string, balance: string, decimals: number) {
      const contract = ERC20.create({
        name: name,
        logo: imageUrl,
        address: contractAddress,
        balance: balance,
        decimals: decimals,
      })
      self.coins.set(contract.address, contract);
    },
    setNFTs(nfts: any) {
      self.nfts.clear();
      for (var nft of nfts) {
        this.setNFT(nft.name, nft.collectionName, nft.contractAddress, nft.tokenId, nft.imageUrl, nft.price)
      }
    },
    setNFT(name: string, collectionName: string, contractAddress: string, tokenId: string, imageUrl: string, price?: string) {
      const nft = ERC721.create({
        name: name,
        collectionName: collectionName,
        address: contractAddress,
        tokenId: tokenId,
        imageUrl: imageUrl,
        lastPrice: price || '0',
      })
      self.nfts.set(contractAddress+tokenId, nft);
    },
    setBalance(balance: string) {
      self.balance = balance
    },
    clearWallet() {
      self.coins.clear();
      self.nfts.clear();
    }
  }))

export type EthWalletType = Instance<typeof EthWallet>

export const EthTransaction = types
  .model('EthTransaction', {
    hash: types.identifier,
    amount: types.string,
    network: types.enumeration(['ethereum', 'bitcoin']),
    ethType: types.maybe(types.string),
    type: types.enumeration(['sent', 'received']),

    initiatedAt: types.string,
    completedAt: types.maybeNull(types.string),

    ourAddress: types.string,
    theirPatp: types.maybeNull(types.string),
    theirAddress: types.string,

    status: types.enumeration(['pending', 'failed', 'succeeded']),
    failureReason: types.maybeNull(types.string),

    notes: types.string,
  })

export type TransactionType = Instance<typeof EthTransaction>;

export const EthStore = types
  .model('EthStore', {
    network: types.enumeration(['mainnet', 'gorli']),
    wallets: types.map(EthWallet),
    transactions: types.map(EthTransaction),
    settings: Settings,
    initialized: types.boolean,
  })
  .views((self) => ({
    get list() {
      return Array.from(self.wallets).map(
        ([key, wallet]) => ({
          key: key,
          nickname: wallet.nickname,
          address: wallet.address,
          balance: wallet.balance,
        })
      );
    },
    getTransaction(hash: string) {
      const tx: any = self.transactions.get(hash);
      return {
        hash: tx.hash,
        amount: tx.amount,
        network: tx.network,
        type: tx.type,
        'initiated-at': tx.initiatedAt,
        'completed-at': tx.completedAt || 1,
        'our-address': tx.ourAddress,
        'their-patp': tx.theirPatp || 1,
        'their-address': tx.theirAddress,
        status: tx.status,
        'failure-reason': tx.failureReason || 1,
        notes: tx.notes,
      }
    }
  }))
  .actions((self) => ({
    initial(wallets: any) {
      const ethWallets = wallets.ethereum;
      Object.entries(ethWallets).forEach(([key, wallet]) => {
        const walletUpdate = {
          ...(wallet as any),
          key: key,
          coins: {},
          nfts: {},
        }
        this.applyWalletUpdate(walletUpdate)
      })
      /*for (var wallet in ethWallets) {
        this.applyWalletUpdate(wallet);
      }*/
      /*Object.entries(ethWallets).forEach(([key, wallet]) => {
        ethWallets[key] = {
          network: 'ethereum',
          nickname: (wallet as any).nickname,
          path: (wallet as any).path,
          balance: gweiToEther((wallet as any).balance).toString(),
          address: (wallet as any).address,
        }
      })
      applySnapshot(self.wallets, ethWallets);
      */
    },
    applyHistory(history: any) {
      const ethHistory = history.ethereum;
      console.log(ethHistory);
      let formattedHistory: any = {};
      Object.entries(ethHistory).forEach(([key, transaction]) => {
        const tx = (transaction as any);
        formattedHistory[tx.hash] = {
          hash: tx.hash,
          amount: tx.amount,
          network: 'ethereum',
          type: tx.type,
          initiatedAt: tx.initiatedAt,
          completedAt: tx.completedAt || '',
          ourAddress: tx.ourAddress,
          theirPatp: tx.theirPatp,
          theirAddress: tx.theirAddress,
          status: tx.status,
          failureReason: tx.failureReason || '',
          notes: tx.notes || '',
        }
      });
      console.log(formattedHistory);
      const map = types.map(EthTransaction);
      const newHistory = map.create(formattedHistory);
      applySnapshot(self.transactions, getSnapshot(newHistory));
    },
    // pokes
    setProvider(provider: string) {
      self.settings.provider = provider;
    },
    setDefaultWallet(index: number) {
      self.settings!.defaultIndex = index;
    },
    enqueueTransaction(hash: any, toAddress: any, toPatp: any, from: string, amount: any, timestamp: any, contractType?: string) {
      let tx = {
        hash: hash,
        amount: gweiToEther(amount).toString(),
        network: 'ethereum',
        ethType: contractType || 'ETH',
        type: 'sent',
        initiatedAt: timestamp.toString(),
        ourAddress: from,
        theirAddress: toAddress,
        theirPatp: toPatp,
        status: 'pending',
        notes: '',
      };
      self.transactions.set(hash, tx);
    },
    applyWalletUpdate: flow(function*(wallet: any) {
      var walletObj;
      if (!self.wallets.has(wallet.key)) {
        walletObj = {
          network: 'ethereum',
          path: wallet.path,
          address: wallet.address,
          balance: '0',
          coins: {},
          nfts: {},
          nickname: wallet.nickname,
        };
        self.wallets.set(wallet.key, EthWallet.create(walletObj));
      }
        /*for (var contract in wallet.contracts) {
          if (wallet.contracts[contract].type === 'erc20') {
            let coin: any = wallet.contracts[contract];
            if ((coin.address as string).length <= 42) {
              const diff = 42 - (coin.address as string).length;
              for (var i = 0; i < diff; ++i) {
                coin.address = coin.address.substring(0,2) + '0' + coin.address.substring(2);
              }
            }
            if (coins.get(coin.address)) {
              let balanceString: string = coin.balance.toString();
              if (balanceString != '0') {
                const decimals = coins.get(coin.address)!.decimals;
                balanceString = balanceString.split("").reverse().join("");
                balanceString = balanceString.substring(0,decimals) + '.' + balanceString.substring(decimals);
                balanceString = balanceString.split("").reverse().join("");
              }
              coins.get(coin.address)!.setBalance(balanceString);
            }
            else
              console.log((coin.address as string).length)
          }
          if (wallet.contracts[(contract as any)].type === 'erc721') {
            let nft: any = wallet.contracts[contract];
            for (var token in nft.tokens) {
              // if token not in tokens
              if (!nfts[token])
              {
                const response = yield alchemy.nft.getNftMetadata(
                  nft.address,
                  token
                );
                var newToken = {
                  name: response.title,
                  collectionName: response.tokenType,
                  address: nft.address,
                  tokenId: response.tokenId,
                  imageUrl: response.tokenUri!.toString(),
                  lastPrice: '0',
                  floorPrice: '0'
                };
                nfts[nft.address+token] = newToken;
              }
            }
          }
        }*/
    }),
    applyTransactionUpdate(transaction: any) {
      let tx = self.transactions.get(transaction.transaction.hash);
      if (tx) {
        tx.completedAt = Date.now().toString();
        if (transaction.transaction.success)
          tx.status = "succeeded";
        else
          tx.status = "failed";
      }
      else
        self.transactions.set(transaction.transaction.hash, transaction.transaction);
    },
    setNetwork(network: string) {
      self.network = network
    }
  }));

export const WalletStore = types
  .model('WalletStore', {
    network: types.enumeration(['ethereum', 'bitcoin']),
    currentView: types.enumeration(Object.values(WalletView)),
    returnView: types.maybe(types.enumeration(Object.values(WalletView))),
    currentItem: types.maybe(types.model({
      type: types.enumeration(['transaction', 'coin', 'nft']),
      key: types.string
    })),
    currentTransaction: types.maybe(types.string),
    bitcoin: BitcoinStore,
    ethereum: EthStore,
    creationMode: types.string,
    sharingMode: types.string,
    whitelist: types.map(types.string),
    blacklist: types.map(types.string),
    ourPatp: types.maybe(types.string),
    currentAddress: types.maybe(types.string),
    currentIndex: types.maybe(types.string),
    passcodeHash: types.maybe(types.string),
    lastInteraction: types.Date
  })
  .actions((self) => ({
    setInitial(network: 'bitcoin' | 'ethereum', wallets: any) {
      if (network === 'ethereum') {
        self.ethereum.initial(wallets);
          self.currentView = WalletView.ETH_LIST;
      } else {
        self.currentView = WalletView.BIT_LIST;
      }
    },
    setNetwork(network: 'bitcoin' | 'ethereum') {
      self.network = network;
      if (network === 'ethereum') {
        self.currentView = WalletView.ETH_LIST;
      } else {
        self.currentView = WalletView.BIT_LIST;
      }
    },
    setView(view: WalletView, index?: string, item?: { type: 'transaction' | 'coin' | 'nft', key: string }) {
      if (view === WalletView.LOCKED && self.currentView === WalletView.LOCKED) {
        // don't allow setting locked multiple times
        return;
      }

      if (index) {
        self.currentIndex = index;
      }

      if (item) {
        self.currentItem = item;
      } else {
        self.currentItem = undefined;
      }

      let returnView = self.currentView;
      if (returnView === WalletView.LOCKED) {
        // the return view should never be locked
        returnView = WalletView.ETH_LIST;
      }

      self.returnView = returnView;
      self.currentView = view;
    },
    setReturnView(view: WalletView) {
      self.returnView = view;
    },
    setNetworkProvider(network: 'bitcoin' | 'ethereum', provider: string) {
      if (network == 'bitcoin')
        self.bitcoin.setProvider(provider)
      else if (network == 'ethereum')
        self.ethereum.setProvider(provider);
    },
    setPasscodeHash(hash: string) {
      self.passcodeHash = hash;
    },
    setLastInteraction(date: Date) {
      self.lastInteraction = date;
    },
    setSharingPermissions(type: string, who: string) {
      if (type === 'allow') {
        self.whitelist.put(who);
      }
      else if (type === 'block') {
        self.blacklist.put(who);
      }
    }
  }));

export type WalletStoreType = Instance<typeof WalletStore>;
