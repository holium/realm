import { Conduit } from '@holium/conduit';
import { SettingsType } from 'os/services/tray/wallet.model';

export const WalletApi = {
  setXpub: async (conduit: Conduit, network: string, xpub: string) => {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'set-xpub': {
          network,
          xpub,
        },
      },
    };
    await conduit.poke(payload);
  },
  setSettings: async (
    conduit: Conduit,
    network: string,
    settings: SettingsType
  ) => {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'set-settings': {
          network,
          mode: settings.walletCreationMode,
          who: settings.sharingMode,
          blocked: settings.blocked,
          'share-index': settings.defaultIndex,
        },
      },
    };
    await conduit.poke(payload);
  },
  changeDefaultWallet: async (
    conduit: Conduit,
    network: string,
    index: number
  ) => {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'change-default-wallet': {
          network,
          index,
        },
      },
    };
    await conduit.poke(payload);
  },
  createWallet: async (
    conduit: Conduit,
    sender: string,
    network: string,
    nickname: string
  ) => {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'create-wallet': {
          sndr: sender,
          network,
          nickname,
        },
      },
    };
    await conduit.poke(payload);
  },
  requestAddress: async (conduit: Conduit, network: string, from: string) => {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'request-address': {
          network,
          from,
        },
      },
    };
    await conduit.poke(payload);
  },
  getAddress: async (conduit: Conduit, network: string, from: string) => {
    console.log('get wallet address watch');
    return await new Promise<string>((resolve, reject) => {
      conduit.watch({
        app: 'realm-wallet',
        path: '/address/' + network + '/' + from,
        onEvent: (data: any) => {
          resolve(data);
        },
        onError: (_id: number, err: Error) => {
          console.log('Subscription rejected');
          reject(err);
        },
        onQuit: () => {
          // console.log('Kicked from subscription'),
        },
      });
    });
  },
  setTransaction: async (
    conduit: Conduit,
    network: string,
    net: string,
    wallet: number,
    hash: string,
    transaction: any
  ) => {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'set-transaction': {
          network,
          net,
          wallet,
          hash,
          transaction,
        },
      },
    };
    await conduit.poke(payload);
  },
  saveTransactionNotes: async (
    conduit: Conduit,
    network: string,
    net: string,
    wallet: number,
    hash: string,
    notes: string
  ) => {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'save-transaction-notes': {
          network,
          net,
          wallet,
          hash,
          notes,
        },
      },
    };
    await conduit.poke(payload);
  },

  getWallets: async (conduit: Conduit) => {
    return await conduit.scry({
      app: 'realm-wallet',
      path: '/wallets',
    });
  },
  subscribeToWallets: async (
    conduit: Conduit,
    handler: (transaction: any) => void
  ) => {
    conduit.watch({
      app: 'realm-wallet',
      path: '/wallets',
      onEvent: (data: any) => {
        handler(data);
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
  subscribeToTransactions: async (
    conduit: Conduit,
    handler: (transaction: any) => void
  ) => {
    conduit.watch({
      app: 'realm-wallet',
      path: '/transactions',
      onEvent: (data: any) => {
        handler(data);
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
  getSettings: async (conduit: Conduit) => {
    return await conduit.scry({
      app: 'realm-wallet',
      path: '/settings',
    });
  },
};

export const handleWalletReactions = (
  data: any,
  walletState: WalletStoreType,
  onWallet: () => void
) => {
  const reaction: string = Object.keys(data)[0];
  switch (reaction) {
    case 'wallet':
      console.log('got wallet update')
      const wallet = data.wallet;
      if (wallet.network === 'ethereum') {
        walletState!.ethereum.applyWalletUpdate(wallet);
      } else if (wallet.network === 'bitcoin') {
        walletState!.bitcoin.applyWalletUpdate(wallet);
      } else if (wallet.network === 'btctestnet') {
        walletState!.btctest.applyWalletUpdate(wallet);
      }
      onWallet();
      break;
    case 'wallets':
      const wallets = data.wallets;
      if (
        Object.keys(wallets.ethereum).length !== 0 ||
        Object.keys(wallets.bitcoin).length !== 0 ||
        Object.keys(wallets.btctestnet).length !== 0
      ) {
        walletState!.setInitialized(true);
      }
      walletState!.ethereum.initial(wallets);
      walletState!.bitcoin.initial(wallets.bitcoin);
      walletState!.btctest.initial(wallets.btctestnet);
      onWallet();
      break;
    case 'transaction':
      const transaction = data.transaction;
      const network: NetworkStoreType =
        transaction.net === ProtocolType.ETH_MAIN ||
        transaction.net === ProtocolType.ETH_GORLI ||
        transaction.net === ProtocolType.UQBAR
          ? NetworkStoreType.ETHEREUM
          : transaction.net === ProtocolType.BTC_MAIN
          ? NetworkStoreType.BTC_MAIN
          : NetworkStoreType.BTC_TEST;
      if (network === NetworkStoreType.ETHEREUM) {
        walletState!.ethereum.wallets
          .get(transaction.index)!
          .applyTransactionUpdate(transaction.net, transaction.transaction);
      } else if (network === NetworkStoreType.BTC_MAIN) {
        walletState!.ethereum.wallets
          .get(transaction.index)!
          .applyTransactionUpdate(transaction.net, transaction.transaction);
      } else if (network === NetworkStoreType.BTC_TEST) {
        /*walletState!.btctest.wallets.get(
          transaction.index
        )!.applyTransactions(transaction.net, transaction.transaction);*/
      }
      break;
    case 'settings':
      walletState.setSettings(data.settings);
      break;
    default:
      break;
  }
};
