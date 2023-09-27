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

function generateKeyAdd(
  rootPublicKey: `0x${string}`,
  walletAddress: `0x${string}`
) {
  return {
    link_metadata: {
      from_entity: 'passport_root',
      signing_public_key: rootPublicKey,
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
      public_key: walletAddress,
      public_key_type: 'device_key',
      entity_name: 'passport_root',
    },
  };
}

export async function createEpochPassportNode(
  shipUrl: string,
  walletName: string,
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
    ['wallet-source']: walletName,
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

// export async function addKey(passport: PassportProfile) {
//   let wallet = ethers.Wallet.createRandom();
//   let link_metadata: any = {
//     link_id: 'KEY_ADD',

//   };

//   link_metadata.link_id = link_type
//   // TODO remove one of these below from the type
//   link_metadata.epoch_block_number = entity_state.epoch_block_number
//   link_metadata.previous_epoch_nonce = entity_state.epoch_block_number
//   link_metadata.previous_epoch_hash = entity_state.previous_epoch_hash
//   if(previous_block == 0){
//     link_metadata.nonce = 0
//     link_metadata.previous_link_hash = "0x00000000000000000000000000000000"
//     link_metadata.data_block_number = 0
//   } else {
//     link_metadata.data_block_number = entity_state.data_block_number + 1
//     link_metadata.nonce = JSON.parse(previous_block.data).link_metadata.nonce + 1
//     link_metadata.previous_link_hash = previous_block.hash
//     link_metadata.data_block_number = JSON.parse(previous_block.data).link_metadata.data_block_number + 1
//   }

//   link_metadata.timestamp = Number(  (new Date()).getTime()  )
// }

export async function loadNfts(address: `0x${string}`) {
  // let owner = 'vitalik.eth';

  //Call the method to get the nfts owned by this address
  let response = await alchemy.nft.getNftsForOwner(address);

  return response;
}

export async function addKey(shipUrl: string, wallet: WalletClient) {
  if (!wallet.account) {
    console.error('wallet account is undefined');
    return;
  }
  const walletAddress = generatePrivateKey();
  // const account = privateKeyToAccount(walletAddress);
  // const privateWallet = createWalletClient({
  //   account,
  //   chain: mainnet,
  //   transport: custom(window.ethereum),
  // });
  const root = generateKeyAdd(wallet.account.address, walletAddress);
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
