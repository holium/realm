import { Conduit } from '@holium/conduit';
import { ProtocolType, WalletStoreType, WalletView } from '../services/tray/wallet-lib/wallet.model';

export const addDots = (address: string) => {
  return '0x' + address.substring(2).match(/.{4}/g)!.join('.');
};
export const removeDots = (address: string) => {
  console.log('address', address)
  return (address || '').replace(/\./g, '');
};

export const UqbarApi = {
  uqbarDeskExists: async (conduit: Conduit) => {
    const response = await conduit.scry({
      app: 'docket',
      path: `/charges`,
    });
    return Object.keys(response.initial).includes('zig');
  },
  trackAddress: async (conduit: Conduit, address: string, nick: string) => {
    const formattedAddress = addDots(address); 
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
    await conduit.poke(payload);
  },
  enqueueTransaction: async (
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
          from: addDots(from),
          contract,
          town,
          action: {
            give: {
              to: addDots(to),
              amount,
              item,
            },
          },
        },
      },
    };
    await conduit.poke(payload);
  },
  scryPending: async (
    conduit: Conduit,
    from: string,
  ) => {
    console.log('adddots', addDots(from))
    return await conduit.scry({
      app: 'wallet',
      path: `/pending/${addDots(from)}`,
    });
  },
  submitSigned: async (
    conduit: Conduit,
    from: string,
    hash: string,
    rate: number,
    bud: number,
    ethHash?: string,
    sig?: { v: number; r: string; s: string; }
  ) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-poke',
      json: {
        'submit-signed': {
          from,
          hash,
          gas: { rate, bud },
          'eth-hash': ethHash,
          sig
        }
      }
    };
    await conduit.poke(payload);
  },
  deletePending: async (conduit: Conduit, from: string, hash: string) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-poke',
      json: {
        'delete-pending': {
          from,
          hash,
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
        handleTxReactions(conduit, data, walletState);
      },
      onError: () => console.log('Subscription rejected'),
      onQuit: () => console.log('Kicked from subscription %spaces'),
    });
  },
};

const ZIG_CONTRACT_ADDRESS = '0x74.6361.7274.6e6f.632d.7367.697a';

const handleBookReactions = (data: any, walletState: WalletStoreType) => {
  console.log('book')
  console.log(data);
  for (const address of Object.keys(data)) {
    console.log(address)
    for (const contract of Object.keys(data[address])) {
      console.log('contract', contract)
      if (data[address][contract].contract === ZIG_CONTRACT_ADDRESS) {
        console.log('has contract')
        const formattedAddress = address.replaceAll('.','');
        console.log(formattedAddress)
        console.log(walletState.ethereum.wallets.keys())
        for (const key of walletState.ethereum.wallets.keys()) {
          console.log(key)
          if (walletState.ethereum.wallets.get(key)!.address === formattedAddress) {
            console.log('has address')
            console.log(data[address][contract].data)
            const balance = data[address][contract].data.balance;
            walletState.ethereum.wallets.get(key)!.setBalance(ProtocolType.UQBAR, balance);
            walletState.ethereum.wallets.get(key)!.setUqbarTokenId(ProtocolType.UQBAR, data[address][contract].id);
          }
        }
      }
      else {

      }
    }
  }
}

const handleMetadataReactions = (data: any, walletState: WalletStoreType) => {
  console.log('metadata')
  console.log(data);
}

const handleTxReactions = (conduit: Conduit, data: any, walletState: WalletStoreType) => {// }, signTransaction: any) => {
  console.log('tx');
  console.log('from uqbar')
  console.log(data);
  /*setActiveApp('wallet-tray', {
    willOpen: true,
    position: 'top-left',
    anchorOffset: { x: 4, y: 26 },
    dimensions: {
      height: 580,
      width: 330,
    },
  });*/
  // TODO: placeholder, we need to implement the actual send coins functionality
  walletState.navigate(WalletView.TRANSACTION_DETAIL, {
    walletIndex: '0',
    detail: {
      type: 'transaction',
      txtype: 'general',
      key: '0'
    }
  });
}