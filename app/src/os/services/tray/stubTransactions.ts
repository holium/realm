import { TransactionType } from './wallet-lib/wallet.model';

const transactionList = [
  {
    hash: '0xdc2365a4f6baa088697e1a242f5e88dbfb90a615532fc5e61d6b75932b8f27bc',
    amount: '0.8521779026000195',
    network: 'ethereum',
    type: 'sent',

    initiatedAt: '2020-01-09T05:00:00.000Z',
    completedAt: '2020-01-09T05:00:05.000Z',

    ourAddress: '0x617efe483c6a90a80cff9bf32e846f2e4923eb54',
    theirPatp: '~pen',
    theirAddress: '0xfac5153486d4618c1d6b168172026b49611024da',

    status: 'succeeded',
    notes: '',
    failureReason: '',
  },
  {
    hash: '0x42768d919b34fa46cd982ec43ec733f25a7621d130d3ef3606819332f2513173',
    amount: '5.738482737400000',
    network: 'ethereum',
    type: 'received',

    initiatedAt: '2020-07-12T05:03:00.000Z',
    completedAt: '2020-07-12T05:03:05.000Z',

    ourAddress: '0x617efe483c6a90a80cff9bf32e846f2e4923eb54',
    theirPatp: '~pen',
    theirAddress: '0xfac5153486d4618c1d6b168172026b49611024da',

    status: 'succeeded',
    notes: '',
    failureReason: '',
  },
  {
    hash: '0x57c64aa7173f5cacf9ce42dcdc5ae405d2e23b7b1869506c9bf0f436e11f38c5',
    amount: '0.000832342324',
    network: 'ethereum',
    type: 'sent',

    initiatedAt: '2022-09-09T11:00:12.000Z',
    completedAt: '2022-09-09T11:00:17.000Z',

    ourAddress: '0x617efe483c6a90a80cff9bf32e846f2e4923eb54',
    theirPatp: '~latter-bolden',
    theirAddress: '0xfac5153486d4618c1d6b168172026b49611024da',

    status: 'failed',
    notes: '',
    failureReason: '',
  },
  {
    hash: '0xdc2365a4f6baa088697e1a242f5e88dbfb90a615532fc5e61d6b75932b8f27bc',
    amount: '0.8521779026000195',
    network: 'ethereum',
    type: 'sent',

    initiatedAt: '2020-01-09T05:00:00.000Z',
    completedAt: '2020-01-09T05:00:05.000Z',

    ourAddress: '0x12e57d25a77e4a04d17abcee2f2602b1d28c2a87',
    theirPatp: '~bus',
    theirAddress: '0xfac5153486d4618c1d6b168172026b49611024da',

    status: 'succeeded',
    notes: '',
    failureReason: '',
  },
  {
    hash: '0x42768d919b34fa46cd982ec43ec733f25a7621d130d3ef3606819332f2513173',
    amount: '5.738482737400000',
    network: 'ethereum',
    type: 'received',

    initiatedAt: '2020-07-12T05:03:00.000Z',
    completedAt: '2020-07-12T05:03:05.000Z',

    ourAddress: '0x12e57d25a77e4a04d17abcee2f2602b1d28c2a87',
    theirAddress: '0xfac5153486d4618c1d6b168172026b49611024da',

    status: 'succeeded',
    notes: '',
    failureReason: '',
  },
  {
    hash: '0x57c64aa7173f5cacf9ce42dcdc5ae405d2e23b7b1869506c9bf0f436e11f38c5',
    amount: '0.000832342324',
    network: 'ethereum',
    type: 'sent',

    initiatedAt: '2022-09-09T11:00:12.000Z',
    completedAt: '2022-09-09T11:00:17.000Z',

    ourAddress: '0x12e57d25a77e4a04d17abcee2f2602b1d28c2a87',
    theirPatp: '~bisfun-hatfes',
    theirAddress: '0xfac5153486d4618c1d6b168172026b49611024da',

    status: 'succeeded',
    notes: '',
    failureReason: '',
  },
];

interface StringMap {
  [key: string]: TransactionType;
}

export const stubTransactions = transactionList.reduce<StringMap>(
  (accum, curr: any) => {
    accum[curr.hash] = curr;
    return accum;
  },
  {}
);

// export function genStubTransactions (address: string) {
//   return transactionList.reduce((accum, curr) => {
//     curr.ourAddress = address
//     accum[curr.hash] = curr
//     return accum
//   }, {} as StringMap)
// }

// let TransMap = types.map(EthTransaction)
// let stubTransactions = TransMap.create()
// transactionList.forEach(trans => {
//   let transModel = EthTransaction.create(trans)
//   stubTransactions.set(transModel.hash, transModel)
// })
