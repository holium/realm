import { settings } from '@urbit/api';
import {
  applySnapshot,
  types,
  Instance,
} from 'mobx-state-tree';
import { Patp } from 'os/types';
import { WalletActions } from 'renderer/logic/actions/wallet';

export enum WalletView {
  ETH_LIST = 'ethereum:list',
  ETH_NEW = 'ethereum:new',
  ETH_DETAIL = 'ethereum:detail',
  ETH_TRANSACTION = 'ethereum:transaction',
  ETH_SETTINGS = 'ethereum:settings',
  BIT_LIST = 'bitcoin:list'
}

const gweiToEther = (gwei: number) => {
  return gwei / 1000000000;
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
  balance: types.string,
  conversions: types.maybe(
    types.model({
      usd: types.maybe(types.string),
      cad: types.maybe(types.string),
      euro: types.maybe(types.string),
    })
  ),
});

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
        path: wallet.wallet.path,
        address: wallet.wallet.address,
        balance: wallet.wallet.balance.toString(),
      };
      self.wallets.set(wallet.key, BitcoinWallet.create(walletObj));
    }
  }));

const SmartContract = types.model('SmartContract', {
  name: types.string,
  address: types.string,
  balance: types.maybe(types.number),
  tokens: types.maybe(types.map(types.number)),
});

const EthWallet = types.model('EthWallet', {
  network: types.string,
  path: types.string,
  address: types.string,
  balance: types.string,
  contracts: types.map(SmartContract),
  nickname: types.string,
  conversions: types.maybe(
    types.model({
      usd: types.maybe(types.string),
      cad: types.maybe(types.string),
      euro: types.maybe(types.string),
    })
  ),
});

const EthTransaction = types
  .model('EthTransaction', {
    status: types.string, // pending, approved, failed
    from: types.string,
    toShip: types.maybe(types.string),
    toAddress: types.maybe(types.string),
    amount: types.string,
  })

export const EthStore = types
  .model('EthStore', {
    wallets: types.map(EthWallet),
    transactions: types.map(EthTransaction),
    settings: Settings,
    initialized: types.boolean,
  })
  .views((self) => ({
    get list() {
      return Array.from(self.wallets.values()).map(
        (wallet: any, index: number) => ({
          name: wallet.nickname,
          address: wallet.address,
          balance: wallet.balance,
        })
      );
    },
  }))
  .actions((self) => ({
    initial(wallets: any) {
      const ethWallets = wallets.ethereum;
      Object.entries(ethWallets).forEach(([key, wallet]) => {
        ethWallets[key] = {
          network: 'ethereum',
          path: (wallet as any).path,
          balance: gweiToEther((wallet as any).balance).toString(),
          address: (wallet as any).address,
        }
      })
      applySnapshot(self.wallets, ethWallets);
    },
    applyHistory(history: any) {

    },
    // pokes
    setProvider(provider: string) {
      self.settings.provider = provider;
    },
    setDefaultWallet(index: number) {
      self.settings!.defaultIndex = index;
    },
    enqueueTransaction(transaction: any) {
      self.transactions.put(transaction);
    },
    // updates
    applyWalletUpdate(wallet: any) {
      const walletObj = {
        network: 'ethereum',
        path: wallet.wallet.path,
        address: wallet.wallet.address,
        balance: gweiToEther(wallet.wallet.balance).toString(),
        nickname: wallet.wallet.nickname,
        contracts: {},
      };
      self.wallets.set(wallet.key, EthWallet.create(walletObj));
    },
    applyTransactionUpdate(transaction: any) {
      let tx = self.transactions.get(transaction.key)!;
      if (transaction.status)
        tx.status = "approved";
      else
        tx.status = "failed";
//      self.transactions.set(transaction.key, tx);
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
    ]),
    bitcoin: BitcoinStore,
    ethereum: EthStore,
    creationMode: types.string,
    ourPatp: types.maybe(types.string),
    currentAddress: types.maybe(types.string),
    passcodeHash: types.maybe(types.string),
  })
  .actions((self) => ({
    setInitial(network: 'bitcoin' | 'ethereum', wallets: any) {
      if (network === 'ethereum') {
        self.ethereum.initial(wallets);
//        if (self.ethereum.initialized)
          self.currentView = 'ethereum:list';
//        else
//          self.currentView = 'ethereum:new'
      } else {
        //  self.bitcoin.initial(wallets);
        self.currentView = 'bitcoin:list';
      }
      // if (network === 'bitcoin') self.bitcoin.initial(wallets);
    },
    setNetwork(network: 'bitcoin' | 'ethereum') {
      self.network = network;
      if (network === 'ethereum') {
        self.currentView = 'ethereum:list';
      } else {
        self.currentView = 'bitcoin:list';
      }
    },
    setView(view: WalletView, address?: string) {
      self.currentView = view;
      if (view.includes('detail')) {
        self.currentAddress = address;
      } else {
        self.currentAddress = undefined;
      }
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
