import { types, Instance } from 'mobx-state-tree';

export type ProtocolType = 'ethmain' | 'ethgorli' | 'btcmain' | 'btctest' | 'uqbar' | string;

export enum WalletView {
  LIST = 'list',
  NEW = 'new',
  WALLET_DETAIL = 'detail',
  TRANSACTION_DETAIL = 'transaction',
  NFT_DETAIL = 'ethereum:nft',
  LOCKED = 'locked',
  SETTINGS = 'settings',
  CREATE_WALLET = 'create-wallet',
}

export enum NetworkType {
  ETHEREUM = 'ethereum',
  BITCOIN = 'bitcoin',
}
const Networks = types.enumeration(Object.values(NetworkType));

export interface UISettingsType {
  walletCreationMode: WalletCreationMode;
  sharingMode: SharingMode;
  blocked: string[];
  defaultIndex: number;
  provider: string;
}

export type SettingsType = Instance<typeof Settings>;

export enum WalletCreationMode {
  DEFAULT = 'default',
  ON_DEMAND = 'on-demand',
}

export enum SharingMode {
  NOBODY = 'nobody',
  FRIENDS = 'friends',
  ANYBODY = 'anybody',
}

const Settings = types.model('Settings', {
  walletCreationMode: types.enumeration(Object.values(WalletCreationMode)),
  sharingMode: types.enumeration(Object.values(SharingMode)),
  blocked: types.array(types.string),
  defaultIndex: types.integer,
  provider: types.maybe(types.string),
});

export interface WalletNavOptions {
  canReturn?: boolean;
  network?: NetworkType;
  walletIndex?: string;
  detail?: {
    type: 'transaction' | 'coin' | 'nft';
    key: string;
  };
  action?: {
    type: string;
    data: any;
  };
}

export const WalletNavState = types.model('WalletNavState', {
  view: types.enumeration(Object.values(WalletView)),
  network: Networks,
  btcNetwork: types.enumeration(['mainnet', 'testnet']),
  walletIndex: types.maybe(types.string),
  detail: types.maybe(
    types.model({
      type: types.enumeration(['transaction', 'coin', 'nft']),
      key: types.string,
    })
  ),
  action: types.maybe(
    types.model({
      type: types.string,
      data: types.frozen(),
    })
  ),
});
export type WalletNavStateType = Instance<typeof WalletNavState>;

export type AccountType = {
  addr: string; // public address
  type: 'eth' | 'btc' | 'uqbar' | string;
  path: string | null; // HD path
  index: number | null; // HD index
  nickname: string | null;
  pubkey: string; // raw public key
  privkey: string; // raw private key
  balance: number;
  transactions: any[];
  assets: Asset[];
};

export type Asset = {
  addr: ContractAddr; // smart contract address for eth
  id?: string; // chainId for eth, id for uqbar
  type: 'coin' | 'token' | 'multisig' | string;
  data: NFTAsset | CoinAsset | MultiAsset;
};

// ERC-20
export type CoinAsset = {
  logo: string | null; // url of token logo image
  symbol: string; // USDC, DAI, BNB, etc
  decimals: number; // 8 - used to convert to human readable number
  balance: number; // current account balance
  totalSupply: number; // total supply of the coin
  allowances: { [addr: string]: number };
};

// ERC-721
export type NFTAsset = {
  name: string;
  description: string;
  image: string;
  transferable?: boolean;
  properties: { [key: string]: string | object };
};

// ERC-1155
export type MultiAsset = {
  name: string;
  decimals: number; // 8 - used to convert to human readable number
  description: string;
  image: string;
  balance: number; // current account balance
  properties: { [key: string]: string | object };
};

export type ContractAddr = string;
