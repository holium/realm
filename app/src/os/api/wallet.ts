import { Conduit } from '@holium/conduit';
import { ProtocolType, SettingsType, WalletStoreType, WalletCreationMode, NetworkStoreType } from '@holium/realm-wallet/src/wallet.model';

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
  setPasscodeHash: async (conduit: Conduit, passcodeHash: string) => {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'set-passcode-hash': {
          hash: passcodeHash,
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
    /**
   * watchUpdates
   *
   * @param conduit
   * @param walletState
   */
     watchUpdates: (
      conduit: Conduit,
      walletState: WalletStoreType,
    ): void => {
      conduit.watch({
        app: 'realm-wallet',
        path: '/updates',
        onEvent: async (data: any, _id?: number, mark?: string) => {
          if (mark === 'realm-wallet-update') {
            handleWalletReactions(
              data,
              walletState,
            );
          }
        },
        onError: () => console.log('Subscription rejected'),
        onQuit: () => console.log('Kicked from subscription %spaces'),
      });
    },
};

export const handleWalletReactions = (
  data: any,
  walletState: WalletStoreType,
) => {
  const reaction: string = Object.keys(data)[0];
  switch (reaction) {
    case 'wallet':
      const wallet = data.wallet;
      if (wallet.network === 'ethereum') {
        walletState!.wallets.get(NetworkStoreType.ETHEREUM)!.applyWalletUpdate(
          walletState!.navState.protocol,
          wallet
        );
      } else if (wallet.network === 'bitcoin') {
        // walletState!.wallets.get(NetworkStoreType.BTC_MAIN)!.applyWalletUpdate(wallet);
      } else if (wallet.network === 'btctestnet') {
        // walletState!.wallets.get(NetworkStoreType.BTC_TEST)!.applyWalletUpdate(wallet);
      }
      break;
    case 'wallets':
      const wallets = data.wallets;
      if (
        Object.keys(wallets.ethereum).length !== 0 ||
        Object.keys(wallets.bitcoin).length !== 0 ||
        Object.keys(wallets.btctestnet).length !== 0
      ) {
        console.log('initializing wallet')
        walletState!.setInitialized(true);
      }
      walletState!.wallets.get(NetworkStoreType.ETHEREUM)!.initial(wallets);
      walletState!.wallets.get(NetworkStoreType.BTC_MAIN)!.initial(wallets.bitcoin);
      walletState!.wallets.get(NetworkStoreType.BTC_TEST)!.initial(wallets.btctestnet);
      break;
    case 'transaction':
      const transaction = data.transaction;
      if (transaction.network == 'ethereum')
        walletState!.wallets.get(NetworkStoreType.ETHEREUM)!.wallets.get(
          transaction.index
        )!.applyTransactions(transaction.net, transaction.transaction);
        else if (transaction.network == 'bitcoin') {
          // walletState!.wallets.get(NetworkStoreType.BTC_MAIN)!.wallets.get(transaction.index)!.applyTransactionUpdate(transaction);
        }
      break;
    case 'settings':
      walletState.setSettings(data);
      break;
    default:
      break;
  }
};
