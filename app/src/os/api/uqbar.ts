import { Conduit } from '@holium/conduit';
import { ProtocolType, SettingsType, WalletStoreType, WalletCreationMode, NetworkStoreType, EthStoreType, BitcoinStoreType } from '@holium/realm-wallet/src/wallet.model';

export const WalletApi = {
  trackAddress: async (conduit: Conduit, address: string, nick: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'add-tracked-address': {
          address,
          nick
        },
      },
    };
    await conduit.poke(payload);
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
            console.log('got update')
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
      console.log('got wallet update')
      const wallet = data.wallet;
      console.log(wallet);
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
      console.log('got wallets update')
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
      walletState.setSettings(data);
      break;
    default:
      break;
  }
};
