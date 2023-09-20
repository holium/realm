import { ethers } from 'ethers';
import { EPOCH_NODE_POC } from './types';

import { Network, Alchemy } from 'alchemy-sdk';

// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: 'YVJ7LV7w8esHG18rdnKSERfN_OcyJWY_', // Replace with your Alchemy API Key.
  network: Network.ETH_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

export function generateEpochPassportNode(
  signingPublicKey: `0x${string}`
): EPOCH_NODE_POC {
  const entity = 'passport_root';
  const root_node_data: EPOCH_NODE_POC = {
    link_id: 'PASSPORT_ROOT',
    epoch_block_number: 0,
    data_block_number: 0,
    timestamp: Number(new Date().getTime()),
    previous_epoch_hash: '0x00000000000000000000000000000000',
    pki_state: {
      chain_owner_entities: [entity],
      entity_to_public_keys: {
        [entity]: [signingPublicKey],
      },
      public_key_to_nonce: {
        [signingPublicKey]: 0,
      },
      entity_to_value: {
        [entity]: 1728,
      },
      public_key_to_entity: {
        [signingPublicKey]: entity,
      },
    },
    transaction_types: {
      link_names: [
        'ENTITY_ADD',
        'ENTITY_REMOVE',
        'KEY_ADD',
        'KEY_REMOVE',
        'NAME_RECORD_SET',
      ],
      link_structs: '',
    },
    data_structs: {
      struct_names: ['NAME_RECORD'],
      struct_types: '',
    },
    sig_chain_settings: {
      new_entity_balance: 0,
      epoch_length: 0,
      signing_key: signingPublicKey,
      data_state: {
        NAME_RECORD: {},
      },
    },
  };
  return root_node_data;
}

export async function createEpochPassportNode(
  shipUrl: string,
  wallet: any,
  signingPublicKey: `0x${string}`
) {
  const root = generateEpochPassportNode(signingPublicKey);
  const data_string = JSON.stringify(root);
  const calculated_hash = await ethers.utils.sha256(
    ethers.utils.toUtf8Bytes(data_string)
  );
  const signed_hash = await wallet.signMessage({
    account: signingPublicKey,
    message: calculated_hash,
  });
  const root_node_link = {
    data: data_string,
    hash: calculated_hash,
    signature_of_hash: signed_hash,
    link_type: 'PASSPORT_ROOT',
  };
  // attempt to post payload to ship
  const url = `${shipUrl}/spider/realm/passport-action/passport-vent/passport-vent`;
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      'add-link': root_node_link,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

export async function loadNfts(address: `0x${string}`) {
  // let owner = 'vitalik.eth';

  //Call the method to get the nfts owned by this address
  let response = await alchemy.nft.getNftsForOwner(address);

  return response;
}
