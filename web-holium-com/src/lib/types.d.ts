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

export type ContactInfo = {
  avatar: any | null;
  bio: string | null;
  ship: string;
  'display-name': string | null;
  color: string;
};

export type PassportProfile = {
  nfts: Array<any>;
  cover: any;
  discoverable: boolean;
  contact: ContactInfo;
  'user-status': 'online';
  recommendations: Array<any>;
  crypto: {
    'data-block': number;
    'epoch-block': number;
    'pki-state': {
      'entity-to-value': {
        passport_root: number;
      };
      'entity-to-public-keys': {
        passport_root: Array<string>;
      };
      'public-key-to-nonce': {
        [key: string]: number;
      };
      'chain-owner-entities': Array<string>;
      'public-key-to-entity': {
        [key: string]: string;
      };
    };
    'previous-epoch-hash': string;
    'sig-chain-settings': {
      'epoch-length': number;
      'signing-key': string;
      'new-entity-balance': number;
    };
    timestamp: number;
    'data-structs': 'not-implemented';
    'transaction-types': 'not-implemented';
    'link-id': 'PASSPORT_ROOT';
  } | null;
  addresses: Array<{
    'crypto-signature': {
      'signature-of-hash': string;
      data: string;
      hash: string;
      pubkey: string;
    };
    address: string;
    wallet: 'root';
    pubkey: string;
  }>;
  'default-address': string;
  chain: Array<{
    data: string;
    hash: string;
    link_type: 'PASSPORT_ROOT';
    signature_of_hash: string;
  }>;
};

// crypto/chain/wallet stuff (ask paul)
export interface PKI_STATE {
  chain_owner_entities: Array<string>;
  entity_to_public_keys: Object<string, any>;
  public_key_to_nonce: Object<string, number>;
  entity_to_value: Object<string, number>;
  public_key_to_entity: Object<string, string>;
}

export interface EPOCH_NODE_POC {
  link_id: 'EPOCH_NODE_POC' | 'PASSPORT_ROOT';
  previous_epoch_hash: string;
  epoch_block_number: number;
  data_block_number: number;
  timestamp: number;
  pki_state: PKI_STATE;
  transaction_types: {
    link_names: Array<string>;
    link_structs: Any;
  };
  data_structs: {
    struct_names: Array<string>;
    struct_types: Any;
  };
  sig_chain_settings: any;
  // #TODO, might require custom types, or a list of keys
  // epoch_length : Number
  // epoch_time_period
  // whitelist_keys: Array<String>,
  // blacklist_keys: Array<String>,
  // signing_key, only required in root node
}
