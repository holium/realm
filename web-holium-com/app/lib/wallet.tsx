import { ethers } from 'ethers';
import { createWalletClient, custom, recoverPublicKey } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';
import { Network, Alchemy } from 'alchemy-sdk';

import { EPOCH_NODE_POC, PassportProfile } from './types';
import { WalletClient } from 'wagmi';

declare global {
  interface Window {
    ethereum: any;
  }
}

// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: 'YVJ7LV7w8esHG18rdnKSERfN_OcyJWY_', // Replace with your Alchemy API Key.
  network: Network.ETH_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

function generateEpochPassportNode(
  entity: string,
  walletAddress: `0x${string}`
): EPOCH_NODE_POC {
  // const entity = 'passport_root';
  const root_node_data: EPOCH_NODE_POC = {
    link_id: 'PASSPORT_ROOT',
    epoch_block_number: 0,
    data_block_number: 0,
    timestamp: Number(new Date().getTime()),
    previous_epoch_hash: '0x00000000000000000000000000000000',
    pki_state: {
      chain_owner_entities: [entity],
      entity_to_addresses: {
        [entity]: [walletAddress],
      },
      address_to_nonce: {
        [walletAddress]: 0,
      },
      entity_to_value: {
        [entity]: 0,
      },
      address_to_entity: {
        [walletAddress]: entity,
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
      signing_key: walletAddress,
      data_state: {
        NAME_RECORD: {},
      },
    },
  };
  return root_node_data;
}

function generateDeviceSigningKeyAdd(
  entity: string,
  rootWalletAddress: `0x${string}`,
  walletAddress: `0x${string}`
) {
  return {
    link_metadata: {
      from_entity: entity,
      signing_address: rootWalletAddress,
      value: 1,
      link_id: 'KEY_ADD',
      epoch_block_number: 0,
      previous_epoch_nonce: 0,
      previous_epoch_hash: '0x00000000000000000000000000000000',
      nonce: 0,
      previous_link_hash: '0x00000000000000000000000000000000',
      data_block_number: 0,
      timestamp: Number(new Date().getTime()),
    },
    link_data: {
      address: walletAddress,
      address_type: 'device_key',
      entity_name: entity,
    },
  };
}

function generateAddressAddKey(
  entity: string,
  rootPublicKey: `0x${string}`,
  walletAddress: `0x${string}`
) {
  return {
    link_metadata: {
      from_entity: entity,
      signing_address: rootPublicKey,
      value: 1,
      link_id: 'KEY_ADD',
      epoch_block_number: 0,
      previous_epoch_nonce: 0,
      previous_epoch_hash: '0x00000000000000000000000000000000',
      nonce: 0,
      previous_link_hash: '0x00000000000000000000000000000000',
      data_block_number: 0,
      timestamp: Number(new Date().getTime()),
    },
    link_data: {
      address: walletAddress,
      address_type: 'Eth',
      entity_name: entity,
    },
  };
}

export async function createEpochPassportNode(
  entity: string,
  shipUrl: string,
  walletName: string,
  wallet: any,
  signingPublicKey: `0x${string}`
) {
  if (!wallet) {
    console.error('invalid wallet');
    return;
  }
  const root = generateEpochPassportNode(entity, signingPublicKey);
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
    'wallet-source': walletName,
  };

  console.log('entity: %o', entity);
  console.log('signing public key: %o', signingPublicKey);
  console.log(data_string);
  console.log('calculated hash: %o', calculated_hash);
  console.log('signed hash: %o', signed_hash);
  console.log('root_node_link: %o', root_node_link);
  console.log(
    'final payload: %o',
    JSON.stringify({
      'add-link': root_node_link,
    })
  );

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

export function generateWalletAddress() {
  return generatePrivateKey();
}

export async function addDeviceSigningKey(
  entity: string,
  shipUrl: string,
  wallet: WalletClient,
  rootWalletAddress: `0x${string}`,
  address: `0x${string}`
) {
  if (!wallet.account) {
    console.error('wallet account is undefined');
    return;
  }

  const root = generateDeviceSigningKeyAdd(entity, rootWalletAddress, address);
  const data_string = JSON.stringify(root);
  const calculated_hash = await ethers.utils.sha256(
    ethers.utils.toUtf8Bytes(data_string)
  );
  const signed_hash = await wallet.signMessage({
    message: calculated_hash,
  });
  const root_node_link = {
    data: data_string,
    hash: calculated_hash,
    signature_of_hash: signed_hash,
    link_type: 'KEY_ADD',
  };
  console.log('add-link payload => %o', root_node_link);
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

export async function addWalletAddress(
  entity: string,
  shipUrl: string,
  wallet: WalletClient,
  deviceSigningKey: `0x${string}`,
  walletAddress: `0x${string}`
) {
  if (!wallet.account) {
    console.error('wallet account is undefined');
    return;
  }

  const root = generateAddressAddKey(entity, deviceSigningKey, walletAddress);
  const data_string = JSON.stringify(root);
  const calculated_hash = await ethers.utils.sha256(
    ethers.utils.toUtf8Bytes(data_string)
  );
  const signed_hash = await wallet.signMessage({
    message: calculated_hash,
  });
  const root_node_link = {
    data: data_string,
    hash: calculated_hash,
    signature_of_hash: signed_hash,
    link_type: 'KEY_ADD',
  };
  console.log('add-link payload => %o', root_node_link);
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
