import { Conduit } from '@holium/conduit';
import {
  ProtocolType,
  SettingsType,
  WalletStoreType,
  WalletCreationMode,
  NetworkStoreType,
  EthStoreType,
  BitcoinStoreType,
} from '@holium/realm-wallet/src/wallet.model';

export const WalletApi = {
  trackAddress: async (conduit: Conduit, address: string, nick: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'add-tracked-address': {
          address,
          nick,
        },
      },
    };
    await conduit.poke(payload);
  },
  editNickname: async (conduit: Conduit, address: string, nick: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-poke',
      json: {
        'edit-nickname': {
          address,
          nick,
        },
      },
    };
    await conduit.poke(payload);
  },
  deleteAccount: async (conduit: Conduit, address: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-poke',
      json: {
        'delete-address': {
          address,
        },
      },
    };
    conduit.poke(payload);
  },
  sendTokens: async (
    conduit: Conduit,
    from: string,
    contract: string,
    town: string,
    to: string,
    item: string,
    amount: number
  ) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-poke',
      json: {
        transaction: {
          from,
          contract,
          town,
          action: {
            give: {
              to,
              amount,
              item,
            },
          },
        },
      },
    };
    await conduit.poke(payload);
  },
  getTransactions: async (conduit: Conduit) => {
    return conduit.scry({
      app: 'wallet',
      path: `/transactions`,
    });
  },
  setNode: async (conduit: Conduit, town: number, ship: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-poke',
      json: {
        'set-node': {
          town,
          ship,
        },
      },
    };
    await conduit.poke(payload);
  },
  setIndexer: async (conduit: Conduit, ship: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-poke',
      json: {
        'set-indexer': {
          ship,
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
  watchUpdates: (conduit: Conduit, walletState: WalletStoreType): void => {
    conduit.watch({
      app: 'wallet',
      path: '/book-updates',
      onEvent: async (data: any, _id?: number, mark?: string) => {
        handleBookReactions(data, walletState);
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription %spaces'),
    });
    conduit.watch({
      app: 'wallet',
      path: '/metadata-updates',
      onEvent: async (data: any, _id?: number, mark?: string) => {
        handleMetadataReactions(data, walletState);
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription %spaces'),
    });
    conduit.watch({
      app: 'wallet',
      path: '/tx-updates',
      onEvent: async (data: any, _id?: number, mark?: string) => {
        handleTxReactions(data, walletState);
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription %spaces'),
    });
  },
};

const handleBookReactions = (data: any, walletState: WalletStoreType) => {};

const handleMetadataReactions = (data: any, walletState: WalletStoreType) => {};

const handleTxReactions = (data: any, walletState: WalletStoreType) => {};
