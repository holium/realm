import { Types } from 'aws-sdk/clients/s3';
import {
  applySnapshot,
  types,
  Instance,
  getSnapshot,
} from 'mobx-state-tree';
import { Type } from 'react-spaces';

export enum WalletView {
  ETH_LIST = 'ethereum:list',
  ETH_NEW = 'ethereum:new',
  ETH_DETAIL = 'ethereum:detail',
  TRANSACTION_DETAIL = 'ethereum:transaction',
  ETH_SETTINGS = 'ethereum:settings',
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
  address: types.string,
  balance: types.number,
});

export type ERC20Type = Instance<typeof ERC20>

const ERC721 = types.model('ERC721', {
  name: types.string,
  imageUrl: types.string,
  address: types.string,
  tokens: types.string,//types.map(types.number),
});

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
    addSmartContract(contractId: string, contractType: string, name: string, contractAddress: string) {
      if (contractType === 'erc721') {
        const contract = ERC721.create({
          name: name,
          imageUrl: '',
          address: contractAddress,
          tokens: '',
        })
        self.nfts.set(contract.address, contract);
      }
      else if (contractType === 'erc20') {
        const contract = ERC20.create({
          name: name,
          address: contractAddress,
          balance: 0,
        })
        self.coins.set(contract.address, contract);
      }
    }
  }))

export type EthWalletType = Instance<typeof EthWallet>

export const EthTransaction = types
  .model('EthTransaction', {
    hash: types.identifier,
    amount: types.string,
    network: types.enumeration(['ethereum', 'bitcoin']),
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
        ethWallets[key] = {
          network: 'ethereum',
          nickname: (wallet as any).nickname,
          path: (wallet as any).path,
          balance: gweiToEther((wallet as any).balance).toString(),
          address: (wallet as any).address,
        }
      })
      applySnapshot(self.wallets, ethWallets);
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
    enqueueTransaction(hash: any, toAddress: any, toPatp: any, from: string, amount: any, timestamp: any) {
      let tx = {
        hash: hash,
        amount: gweiToEther(amount).toString(),
        network: 'ethereum',
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
    applyWalletUpdate(wallet: any) {
      const coins = self.wallets.get(wallet.key)!.coins.toJSON();
      const nfts = self.wallets.get(wallet.key)!.nfts.toJSON();
      for (var contract in wallet.contracts) {
        if ((contract as any).type === 'erc20') {
          let coin: any = contract;
          coins[coin.address].balance = coin.balance;
        }
        if ((contract as any).type === 'erc721') {
          let nft: any = contract;
          nfts[nft.address].tokens = nft.tokens;
        }
      }
      const walletObj = {
        network: 'ethereum',
        path: wallet.path,
        address: wallet.address,
        balance: gweiToEther(wallet.balance).toString(),
        coins: coins,
        nfts: nfts,
        nickname: wallet.nickname,
      };
      self.wallets.set(wallet.key, EthWallet.create(walletObj));
    },
    applyTransactionUpdate(transaction: any) {
      /*let tx = self.transactions.get(transaction.transaction.hash)!;
      console.log(tx);
      tx.completedAt = Date.now().toString();
      if (transaction.transaction.success)
        tx.status = "succeeded";
      else
        tx.status = "failed";
      console.log()*/
      self.transactions.set(transaction.transaction.hash, transaction.transaction);
    },
  }));

export const WalletStore = types
  .model('WalletStore', {
    network: types.enumeration(['ethereum', 'bitcoin']),
    currentView: types.enumeration([
      'ethereum:list',
      'ethereum:new',
      'ethereum:detail',
      'ethereum:transaction',
      'ethereum:settings',
      'bitcoin:list',
      'create-wallet'
    ]),
    returnView: types.maybe(types.enumeration([
      'ethereum:list',
      'ethereum:new',
      'ethereum:detail',
      'ethereum:transaction',
      'ethereum:settings',
      'bitcoin:list',
      'create-wallet'
    ])),
    currentTransaction: types.maybe(types.string),
    bitcoin: BitcoinStore,
    ethereum: EthStore,
    creationMode: types.string,
    ourPatp: types.maybe(types.string),
    currentAddress: types.maybe(types.string),
    currentIndex: types.maybe(types.string),
    passcodeHash: types.maybe(types.string),
  })
  .actions((self) => ({
    setInitial(network: 'bitcoin' | 'ethereum', wallets: any) {
      if (network === 'ethereum') {
        self.ethereum.initial(wallets);
          self.currentView = 'ethereum:list';
      } else {
        self.currentView = 'bitcoin:list';
      }
    },
    setNetwork(network: 'bitcoin' | 'ethereum') {
      self.network = network;
      if (network === 'ethereum') {
        self.currentView = 'ethereum:list';
      } else {
        self.currentView = 'bitcoin:list';
      }
    },
    setView(view: WalletView, index?: string, transaction?: string) {
      if (index) {
        self.currentIndex = index;
      }
      if (transaction) {
        self.currentTransaction = transaction;
      }
      self.returnView = self.currentView;
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
    }
  }));

export type WalletStoreType = Instance<typeof WalletStore>;
