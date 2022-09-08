import { applySnapshot, castToSnapshot, types } from 'mobx-state-tree';
import { type } from 'os';
import { RealmWallet, Wallet } from './lib/wallet';

export const wallet: Wallet | null = null;

export const constructSampleWallet = async () => {
  // const wallet = new RealmWallet();
  const realmWallet = new RealmWallet();

  // const wallet = realmWallet.loadWallet(
  //   'wisdom buzz alcohol cover hour subway bamboo nut strike crop tape duck'
  // );
  const hdWallet = realmWallet.importHDWallet(
    'carry poem leisure coffee issue urban save evolve catch hammer simple unknown',
    0
  );

  console.log(hdWallet);
  // console.log(await realmWallet.generateEthWallets());
  return await realmWallet.generateEthWallets();
};

export enum WalletView {
  ETH_LIST = 'ethereum:list',
  ETH_NEW = 'ethereum:new',
  ETH_DETAIL = 'ethereum:detail',
  ETH_TRANSACTION = 'ethereum:transaction',
  ETH_SETTINGS = 'ethereum:settings',
  BIT_LIST = 'bitcoin:list'
}

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

const EthStore = types
  .model('EthStore', {
    wallets: types.map(EthWallet),
    transactions: types.map(EthTransaction)
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
    hdWallet: types.maybe(types.string),
    currentView: types.enumeration([
      'ethereum:list',
      'ethereum:new',
      'ethereum:detail',
      'ethereum:transaction',
      'ethereum:settings',
      'bitcoin:list',
    ]),
    currentAddress: types.maybe(types.string),
    bitcoin: types.maybe(BitcoinStore),
    ethereum: EthStore,
  })
  .actions((self) => ({
    setInitial(network: 'bitcoin' | 'ethereum', wallets: any) {
      console.log('setting initial wallet store')
      if (network === 'ethereum') {
        self.ethereum.initial(wallets);
        self.currentView = 'ethereum:list';
        self.currentAddress = '0xB017058f7De4efF370AC8bF0c84906BEC3d0b2CE';
      } else {
        //  self.bitcoin.initial(wallets);
        self.currentView = 'bitcoin:list';
      }
      // if (network === 'bitcoin') self.bitcoin.initial(wallets);
    },
    setHdWallet() {
      self.hdWallet = 'bub';
    },
    setView(view: WalletView, address?: string) {
      self.currentView = view;
      if (view.includes('detail')) {
        self.currentAddress = address;
      } else {
        self.currentAddress = undefined;
      }
    },
    setNetwork(network: 'bitcoin' | 'ethereum') {
      console.log('setting network in wallet store')
      self.network = network;
      if (network === 'ethereum') {
        self.currentView = 'ethereum:list';
      } else {
        self.currentView = 'bitcoin:list';
      }
    },
  }));
