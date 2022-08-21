import {
  applySnapshot,
  castToSnapshot,
  types,
  Instance,
} from 'mobx-state-tree';

const BitcoinWallet = types.model('BitcoinWallet', {
  network: types.string,
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
  })
  .actions((self) => ({
    initial(wallets: any) {
      applySnapshot(self.wallets, wallets);
    },
  }));

const EthWallet = types.model('EthWallet', {
  network: types.string,
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

const EthSettings = types
  .model('EthSettings', {
    defaultIndex: types.integer,
    creationMode: types.string,
  })

export const EthStore = types
  .model('EthStore', {
    wallets: types.map(EthWallet),
    transactions: types.map(EthTransaction),
    settings: types.maybe(EthSettings)
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
      applySnapshot(self.wallets, wallets);
    },
    // pokes
    setEthProvider(url: string) {

    },
    // updates
    applyWalletUpdate(wallet: any) {
      self.wallets.put(wallet);
    },
    applyTransactionUpdate(transaction: any) {
      self.transactions.put(transaction);
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
    bitcoin: types.maybe(BitcoinStore),
    ethereum: EthStore,
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