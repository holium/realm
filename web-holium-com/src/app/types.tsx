export type Contact = {
  ship: string;
  avatar: {
    source: 'image' | 'nft';
    uri: string;
  };
  color: string | null;
  ['display-name']: string | null;
  // trent suggested moving bio into contact card
  bio: string | null;
};

export type LinkedNFT = {
  chainId: 'eth-mainnet' | 'eth-testnet';
  tokenId: string;
  contractAddress: string;
  name: string;
  imageUrl: string;
  ownedBy: string;
  tokenStandard: string; // e.g. ERC-721
};

export type LinkedAddress = {
  wallet: string; // e.g. 'rainbow' | 'metamask'
  address: string;
  pubkey: string;
  // signature type?  .. ask about this
  signature: string;
};

export type Recommendation = {
  id: string;
  path: string;
  type: string;
  metdata: object;
};

export type PassportProfile = {
  contact: Contact;
  status: 'invisible' | 'online';
  discoverable: boolean;
  nfts: LinkedNFT[];
  addresses: LinkedAddress[];
  defaultAddress: string;
  recommendations: Recommendation[];
  // signature chain type? .. ask about this
  chain: string;
};
