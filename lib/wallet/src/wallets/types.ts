export type Account = {
  addr: string; // public address
  type: 'eth' | 'btc' | 'uqbar' | string;
  path: string | null; // HD path
  index: number | null; // HD index
  nickname: string | null;
  pubkey: string; // raw public key
  privkey: string; // raw private key
  assets: Asset[];
  transactions: any[];
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
