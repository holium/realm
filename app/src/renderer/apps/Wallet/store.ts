import { applySnapshot, castToSnapshot, types } from 'mobx-state-tree';
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

const EthStore = types
  .model('EthStore', {
    wallets: types.map(EthWallet),
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
