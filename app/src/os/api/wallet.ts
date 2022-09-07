import { hashHostnameBackward } from '@cliqz/adblocker/dist/types/src/request';
import { Conduit } from '@holium/conduit';

export const WalletApi = {
  setXpub: async (conduit: Conduit, network: string, xpub: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'set-xpub': {
          network: network,
          xpub: xpub,
        }
      },
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
        }
      }
    }
    await conduit.poke(payload);
  },
  changeDefaultWallet: async (conduit: Conduit, network: string, index: number) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'change-default-wallet': {
          network: network,
          index: index,
        }
      }
    }
    await conduit.poke(payload);
  },
  setNetworkProvider: async (conduit: Conduit, network: string, provider: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'set-network-provider': {
          network: network,
          provider: provider,
        }
      }
    }
    await conduit.poke(payload);
  },
  createWallet: async (conduit: Conduit, sender: string, network: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'create-wallet': {
          sndr: sender,
          network: network,
        }
      }
    };
    await conduit.poke(payload);
  },
  enqueueTransaction: async (conduit: Conduit, network: string, hash: any, transaction: any) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'enqueue-transaction': {
          network: network,
          hash: hash,
          transaction: transaction,
        }
      },
    };
    await conduit.poke(payload);
  },
  setTransactionPending: async (conduit: Conduit, transactionKey: any) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'set-transaction-pending': {
          transactionKey: transactionKey
        }
      }
    }
    await conduit.poke(payload);
  },
  addSmartContact: async (conduit: Conduit, contractId: string, contractType: string, name: string, contractAddress: string, walletIndex: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'add-smart-contract': {
          'contract-id': contractId,
          'contract-type': contractType,
          'name': name,
          'address': contractAddress,
          'wallet-index': walletIndex
        }
      }
    }
    await conduit.poke(payload);
  },
  getHistory: async (conduit: Conduit) => {
    return await conduit.scry({
      app: 'wallet',
      path: '/history'
    })
  },
  subscribeToTransactions(conduit: Conduit, handler: (transaction: any) => void) {
    conduit.watch({
      app: 'wallet',
      path: '/transactions',
      onEvent: (data: any) => {
        handler(data);
      },
      onErr: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  },
  getWallets: async (conduit: Conduit) => {
    return await conduit.scry({
      app: 'wallet',
      path: '/wallets',
    });
  },
  subscribeToWallets: async (conduit: Conduit, handler: (transaction: any) => void) => {
    conduit.watch({
      app: 'wallet',
      path: '/wallets',
      onEvent: (data: any) => {
        handler(data);
      },
      onErr: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription'),
    });
  }
}
