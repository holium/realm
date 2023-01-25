import { Conduit } from '@holium/conduit';
import {
  ProtocolType,
  WalletStoreType,
} from '../services/tray/wallet-lib/wallet.model';

export const removeDots = (str: string) => {
  return (str || '').replace(/\./g, '');
};
export const addDots = (hex: string) => {
  const clearLead = removeDots(hex.replace('0x', '').toLowerCase());
  let result = '';
  for (let i = clearLead.length - 1; i > -1; i--) {
    if (i < clearLead.length - 1 && (clearLead.length - 1 - i) % 4 === 0) {
      result = '.' + result;
    }
    result = clearLead[i] + result;
  }
  return `0x${result}`;
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
  scryPending: async (conduit: Conduit, from: string) => {
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
    ethHash: string,
    sig: { v: number; r: string; s: string }
  ) => {
    const payload = {
      app: 'wallet',
      mark: 'wallet-poke',
      json: {
        'submit-signed': {
          from,
          hash,
          gas: { rate, bud },
          'eth-hash': addDots(ethHash!),
          sig: {
            v: sig.v,
            r: addDots(sig.r),
            s: addDots(sig.s),
          },
        },
      },
    };
    console.log(payload);
    console.log(payload.json);
    console.log(payload.json['submit-signed'].sig);
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
  for (const address of Object.keys(data)) {
    for (const contract of Object.keys(data[address])) {
      if (data[address][contract].contract === ZIG_CONTRACT_ADDRESS) {
        const formattedAddress = address.replaceAll('.', '');
        for (const key of walletState.ethereum.wallets.keys()) {
          if (
            walletState.ethereum.wallets.get(key)!.address === formattedAddress
          ) {
            const balance = data[address][contract].data.balance;
            walletState.ethereum.wallets
              .get(key)!
              .setBalance(ProtocolType.UQBAR, balance);
            walletState.ethereum.wallets
              .get(key)!
              .setUqbarTokenId(ProtocolType.UQBAR, data[address][contract].id);
          }
        }
      } else {
      }
    }
  }
};

const handleMetadataReactions = (data: any, walletState: WalletStoreType) => {};

const handleTxReactions = (
  conduit: Conduit,
  data: any,
  walletState: WalletStoreType
) => {
  // }, signTransaction: any) => {
  /*if (removeDots(data[Object.keys(data)[0]].from) === walletState.ethereum.wallets.get('0')!.address) {
    walletState.setProtocol(ProtocolType.UQBAR);
    walletState.navigate(WalletView.TRANSACTION_CONFIRM, {
      walletIndex: '0',
      uqTx: data[Object.keys(data)[0]],
      /*detail: {
        type: 'transaction',
        txtype: 'general',
        key: '0'
      }*/
  /*  });
    walletState.setForceActive(true);
  }*/
};
