import { settings } from '@urbit/api';
import {
  applySnapshot,
  castToSnapshot,
  types,
  Instance,
} from 'mobx-state-tree';
import { networkInterfaces } from 'os';

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
          balance: (wallet as any).balance.toString(),
          address: (wallet as any).address,
        }
      })
      applySnapshot(self.wallets, btcWallets);
    },
    // updates
    applyWalletUpdate(wallet: any) {
      const walletObj = {
        network: 'bitcoin',
        path: wallet.wallet.path,
        address: wallet.wallet.address,
        balance: wallet.wallet.balance.toString(),
      };
      self.wallets.set(wallet.key, EthWallet.create(walletObj));
    }
  }));

const EthWallet = types.model('EthWallet', {
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

const EthTransaction = types
  .model('EthTransaction', {
    status: types.string,
    from: types.string,
    toShip: types.maybe(types.string),
    toAddress: types.maybe(types.string),
    amount: types.string,
  })

export const EthStore = types
  .model('EthStore', {
    wallets: types.map(EthWallet),
    transactions: types.map(EthTransaction),
    settings: Settings
  })
  .views((self) => ({
    get list() {
      return Array.from(self.wallets.values()).map(
        (wallet: any, index: number) => ({
          name: `Wallet ${index}`,
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
          balance: (wallet as any).balance.toString(),
          address: (wallet as any).address,
        }
      })
      applySnapshot(self.wallets, ethWallets);
    },
    // pokes
    // updates
    applyWalletUpdate(wallet: any) {
      const walletObj = {
        network: 'ethereum',
        path: wallet.wallet.path,
        address: wallet.wallet.address,
        balance: wallet.wallet.balance.toString(),
      };
      self.wallets.set(wallet.key, EthWallet.create(walletObj));
    },
    applyTransactionUpdate(transaction: any) {
      self.transactions.put(transaction);
    },
    setDefaultWallet(index: number) {
      self.settings!.defaultIndex = index;
    }
  }));

export const WalletStore = types
  .model('WalletStore', {
    network: types.enumeration(['ethereum', 'bitcoin']),
    currentView: types.enumeration([
      'ethereum:list',
      'ethereum:detail',
      'ethereum:transaction',
      'ethereum:settings',
      'bitcoin:list',
    ]),
    bitcoin: BitcoinStore,
    ethereum: EthStore,
    creationMode: types.string
  })
  .actions((self) => ({
    setInitial(network: 'bitcoin' | 'ethereum', wallets: any) {
      if (network === 'ethereum') {
        self.ethereum.initial(wallets);
        self.currentView = 'ethereum:list';
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
  }));

export type WalletStoreType = Instance<typeof WalletStore>;