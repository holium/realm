import { Conduit } from '@holium/conduit';
import { WalletStoreType } from 'os/services/tray/wallet-lib/wallet.model';

export const UqbarApi = {
  trackAddress: async (conduit: Conduit, address: string, nick: string) => {
    const formattedAddress = '0x' + address.substring(2).match(/.{4}/g)!.join('.');
    const payload = {
      app: 'wallet',
      mark: 'wallet-poke',
      json: {
        'add-tracked-address': {
          address: formattedAddress,
          nick,
        },
      },
    };
    console.log(payload);
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

const handleBookReactions = (data: any, walletState: WalletStoreType) => console.log(data);

const handleMetadataReactions = (data: any, walletState: WalletStoreType) => console.log(data);

const handleTxReactions = (data: any, walletState: WalletStoreType) => console.log(data);
