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
  'chain-id': 'eth-mainnet' | 'eth-testnet';
  'token-id': string;
  'contract-address': string;
  name: string;
  'image-url': string;
  'owned-by': string;
  'token-standard': string; // e.g. ERC-721
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
  avatar: null | { type: 'image' | 'nft'; img: string };
  bio: string | null;
  ship: string;
  'display-name': string | null;
  color: string;
};

export type PassportProfile = {
  nfts: Array<LinkedNFT>;
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
    'data-structs': string;
    'transaction-types': string;
    'link-id': string;
  } | null;
  addresses: Array<{
    'crypto-signature': {
      'signature-of-hash': string;
      data: string;
      hash: string;
      pubkey: string;
    };
    address: string;
    wallet: string;
    pubkey: string;
  }>;
  'default-address': string;
  chain: Array<{
    data: string;
    hash: string;
    link_type: string;
    signature_of_hash: string;
  }>;
};

// crypto/chain/wallet stuff (ask paul)
export interface PKI_STATE {
  chain_owner_entities: Array<string>;
  entity_to_addresses: {
    [key: string]: any;
  };
  address_to_nonce: {
    [key: string]: number;
  };
  entity_to_value: {
    [key: string]: number;
  };
  address_to_entity: {
    [key: string]: string;
  };
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

export interface INITIAL_STATE {
  discoverable: boolean;
  passport_api_key?: string;
}

declare global {
  interface Window {
    __INITIAL_STATE__: INITIAL_STATE;
  }
}
