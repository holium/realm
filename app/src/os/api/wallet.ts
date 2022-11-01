import { Conduit } from '@holium/conduit';
import { UISettingsType } from 'os/services/tray/wallet.model';

export const WalletApi = {
  setXpub: async (conduit: Conduit, network: string, xpub: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'set-xpub': {
          network: network,
          xpub: xpub,
        },
      },
    };
    await conduit.poke(payload);
  },
  setSettings: async (conduit: Conduit, network: string, settings: UISettingsType) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'set-settings': {
          network: network,
          mode: settings.walletCreationMode,
          who: settings.sharingMode,
          blocked: settings.blocked,
          'share-index': settings.defaultIndex,
        }
      }
    };
    await conduit.poke(payload);
  },
  setWalletCreationMode: async (conduit: Conduit, mode: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'set-wallet-creation-mode': {
          mode: mode,
        },
      },
    };
    await conduit.poke(payload);
  },
  setSharingMode: async (conduit: Conduit, who: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'set-sharing-mode': {
          who: who
        }
      }
    }
    await conduit.poke(payload);
  },
  setSharingPermissions: async (conduit: Conduit, type: string, who: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'set-sharing-permissions': {
          type: type,
          who: who
        }
      }
    }
    await conduit.poke(payload);
  },
  changeDefaultWallet: async (
    conduit: Conduit,
    network: string,
    index: number
  ) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'change-default-wallet': {
          network: network,
          index: index,
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
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'create-wallet': {
          sndr: sender,
          network: network,
          nickname: nickname,
        },
      },
    };
    await conduit.poke(payload);
  },
  requestAddress: async (conduit: Conduit, network: string, from: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'request-address': {
          network: network,
          from: from,
        },
      },
    };
    await conduit.poke(payload);
  },
  getAddress: async (conduit: Conduit, network: string, from: string) => {
    return new Promise<string>((resolve, reject) => {
      conduit.watch({
        app: 'wallet',
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
    transaction: any,
  ) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'set-transaction': {
          network,
          net,
          wallet,
          hash,
          transaction: transaction,
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
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'save-transaction-notes': {
          network,
          net,
          wallet,
          hash,
          notes,
        }
      }
    };
    await conduit.poke(payload);
  },
  subscribeToTransactions(
    conduit: Conduit,
    handler: (transaction: any) => void
  ) {
    conduit.watch({
      app: 'wallet',
      path: '/transactions',
      onEvent: (data: any) => {
        handler(data);
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
  getWallets: async (conduit: Conduit) => {
    return await conduit.scry({
      app: 'wallet',
      path: '/wallets',
    });
  },
  subscribeToWallets: async (
    conduit: Conduit,
    handler: (transaction: any) => void
  ) => {
    conduit.watch({
      app: 'wallet',
      path: '/wallets',
      onEvent: (data: any) => {
        handler(data);
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
  getSettings: async (conduit: Conduit) => {
    return await conduit.scry({
      app: 'wallet',
      path: '/settings'
    })
  }
};
