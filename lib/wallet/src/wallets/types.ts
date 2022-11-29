export type Account = {
  addr: string; // public address
  type: 'eth' | 'btc' | 'uqbar' | string;
  path: string | null; // HD path
  index: number | null; // HD index
  nickname: string | null;
  pubkey: string; // raw public key
  privkey: string; // raw private key
  transactions: any[];
  // assets: ContractAddr[];
};

export type CoinAsset = {
  logo: string | null; // url of token logo image
  symbol: string; // USDC, DAI, BNB, etc
  decimals: number; // 8 - used to convert to human readable number
  balance: number; // current account balance
  totalSupply: number; // total supply of the coin
  allowances: { [addr: string]: number };
};

export type NFTAsset = {
  name: string;
  description: string;
  image: string;
  transferable?: boolean;
  properties: { [key: string]: string | object };
};

export type MultiAsset = {
  name: string;
  decimals: number; // 8 - used to convert to human readable number
  description: string;
  image: string;
  balance: number; // current account balance
  properties: { [key: string]: string | object };
};

export type Asset = {
  addr: ContractAddr; // smart contract address for eth
  id?: string; // chainId for eth, id for uqbar
  type: 'coin' | 'token' | 'multisig' | string;
  data: NFTAsset | CoinAsset | MultiAsset;
};

export type ContractAddr = string;
