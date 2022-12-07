import { Conduit } from '@holium/conduit';
import { ProtocolType, UISettingsType, WalletStoreType, WalletCreationMode, NetworkStoreType, EthStoreType, BitcoinStoreType } from '@holium/realm-wallet/src/wallet.model';

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
    settings: UISettingsType
  ) => {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        'set-network-settings': {
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
        walletState!.ethereum.applyWalletUpdate(
          walletState!.navState.protocol,
          wallet
        );
      } else if (wallet.network === 'bitcoin') {
        walletState!.bitcoin.applyWalletUpdate(wallet);
      } else if (wallet.network === 'btctestnet') {
        walletState!.btctest.applyWalletUpdate(wallet);
      }
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
      break;
    case 'transaction':
      const transaction = data.transaction;
      if (transaction.network == 'ethereum')
        walletState!.ethereum.wallets.get(
          transaction.index
        )!.applyTransactions(transaction.net, transaction.transaction);
      else if (transaction.network == 'bitcoin') {
        walletState!.ethereum.wallets.get(
          transaction.index
        )!.applyTransactions(transaction.net, transaction.transaction);
        // walletState!.wallets.get(NetworkStoreType.BTC_MAIN)!.wallets.get(transaction.index)!.applyTransactionUpdate(transaction);
      }
      else if (transaction.network == 'btctest') {
        walletState!.ethereum.wallets.get(
          transaction.index
        )!.applyTransactions(transaction.net, transaction.transaction);
      }
      break;
    case 'settings':
      walletState.setSettings(data.settings);
      break;
    default:
      break;
  }
};
