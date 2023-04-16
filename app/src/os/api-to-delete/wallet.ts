import { Conduit } from '@holium/conduit';
import {
  ProtocolType,
  UISettingsType,
  WalletStoreType,
  NetworkStoreType,
} from '../services/tray/wallet-lib/wallet.model';

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
  getEthXpub: async (conduit: Conduit) => {
    return await conduit.scry({
      app: 'realm-wallet',
      path: '/eth-xpub',
    });
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
    contract: string | null,
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
          contract,
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
    contract: string | null,
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
          contract,
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
    onWallet: () => void
  ): void => {
    conduit.watch({
      app: 'realm-wallet',
      path: '/updates',
      onEvent: async (data: any, _id?: number, mark?: string) => {
        if (mark === 'realm-wallet-update') {
          handleWalletReactions(data, walletState, onWallet);
        }
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription %spaces'),
    });
  },
  initialize: async (conduit: Conduit) => {
    const payload = {
      app: 'realm-wallet',
      mark: 'realm-wallet-action',
      json: {
        initialize: null,
      },
    };
    await conduit.poke(payload);
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
      const wallet = data.wallet;
      if (wallet.network === 'ethereum') {
        walletState.ethereum.applyWalletUpdate(wallet);
      } else if (wallet.network === 'bitcoin') {
        walletState.bitcoin.applyWalletUpdate(wallet);
      } else if (wallet.network === 'btctestnet') {
        walletState.btctest.applyWalletUpdate(wallet);
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
        walletState.setInitialized(true);
      }
      walletState.ethereum.initial(wallets);
      walletState.bitcoin.initial(wallets.bitcoin);
      walletState.btctest.initial(wallets.btctestnet);
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
        walletState.ethereum.wallets
          .get(transaction.index)
          ?.applyTransactionUpdate(
            transaction.net,
            transaction.contract,
            transaction.transaction
          );
      } else if (network === NetworkStoreType.BTC_MAIN) {
        /*walletState.bitcoin.wallets
          .get(transaction.index)!
          .applyTransactionUpdate(transaction.net, transaction.transaction);*/
      } else if (network === NetworkStoreType.BTC_TEST) {
        /*walletState.btctest.wallets.get(
          transaction.index
        ).applyTransactions(transaction.net, transaction.transaction);*/
      }
      break;
    case 'settings':
      walletState.setSettings(data.settings);
      break;
    default:
      break;
  }
};
