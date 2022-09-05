import { Urbit } from './../urbit/api';

export const WalletApi = {
  setXpub: async (conduit: Urbit, xpub: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'set-xpub': {
          xpub: xpub,
        }
      },
    };
    await conduit.poke(payload);
  },
  setWalletCreationMode: async (conduit: Urbit, mode: string) => {
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
  changeDefaultWallet: async (conduit: Urbit, network: string, index: number) => {
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
  createWallet: async (conduit: Urbit, sender: string, network: string) => {
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
  enqueueTransaction: async (conduit: Urbit, network: string, transaction: any) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-action',
      json: {
        'enqueue-transaction': {
          network: network,
          transaction: transaction,
        }
      },
    };
    await conduit.poke(payload);
  },
  setTransactionPending: async (conduit: Urbit, transactionKey: any) => {
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
  getNeedsSigning: async (conduit: Urbit) => {
    return await conduit.scry({
      app: 'wallet',
      path: '/needs-signing',
    });
  },
  subscribeToNeedsSigning: async (conduit: Urbit, handler: (transaction: any) => void) => {
    conduit.subscribe({
      app: 'wallet',
      path: '/needs-signing',
      event: (data: any) => {
        console.log('got needs-signing update')
        handler(data);
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
  getTransactions: async (conduit: Urbit) => {
    return await conduit.scry({
      app: 'wallet',
      path: '/transactions',
    })
  },
  subscribeToTransactions(conduit: Urbit, handler: (transaction: any) => void) {
    conduit.subscribe({
      app: 'wallet',
      path: '/transactions',
      event: (data: any) => {
        handler(data);
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  },
  getWallets: async (conduit: Urbit) => {
    return await conduit.scry({
      app: 'wallet',
      path: '/wallets',
    });
  },
  subscribeToWallets: async (conduit: Urbit, handler: (transaction: any) => void) => {
    conduit.subscribe({
      app: 'wallet',
      path: '/wallets',
      event: (data: any) => {
        handler(data);
      },
      err: () => console.log('Subscription rejected'),
      quit: () => console.log('Kicked from subscription'),
    });
  }
}
