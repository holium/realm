import { Alchemy, Network, OwnedNft, OwnedNftsResponse } from 'alchemy-sdk';
import { ethers, Wallet } from 'ethers';
import { english, generateMnemonic } from 'viem/accounts';

import { LinkedNFT, PassportProfile } from './types';

declare global {
  interface Window {
    ethereum: any;
    web3: any;
  }
}

// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: 'YVJ7LV7w8esHG18rdnKSERfN_OcyJWY_', // Replace with your Alchemy API Key.
  network: Network.ETH_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

export type OwnerNft = OwnedNft & { ownerAddress: string };

export async function loadNfts(passport: PassportProfile) {
  const nfts: OwnerNft[] = [];
  for (let i = 0; i < passport.addresses.length; i++) {
    const address = passport.addresses[i];
    if (address.wallet !== 'account') {
      const res: OwnedNftsResponse = await alchemy.nft.getNftsForOwner(
        address.address
      );
      for (let i = 0; i < res.ownedNfts.length; i++) {
        const ownedNft = res.ownedNfts[i];
        nfts.push({ ...ownedNft, ownerAddress: address.address });
      }
    }
  }
  return nfts;
}

export function walletFromKey(key: string) {
  return new ethers.Wallet(key).address;
}

export async function addNft(deviceWallet: Wallet, nfts: LinkedNFT[]) {
  let response = await fetch(
    `/~/scry/passport/template/next-block/metadata-or-root.json`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const metadata = await response.json();

  const payload = {
    'link-metadata': {
      ...metadata,
      timestamp: Number(new Date().getTime()),
      'signing-address': deviceWallet.address,
      'link-id': 'NAME_RECORD_SET',
    },
    'link-data': {
      name: 'nfts',
      record: JSON.stringify(nfts),
    },
  };

  // const root = generateAddressAddKey(entity, deviceSigningKey, walletAddress);
  const data_string = JSON.stringify(payload);
  const calculated_hash = await ethers.utils.sha256(
    ethers.utils.toUtf8Bytes(data_string)
  );

  console.log('signing message...');
  const signed_hash = await deviceWallet.signMessage(calculated_hash);

  const root_node_link = {
    data: data_string,
    hash: calculated_hash,
    'signature-of-hash': signed_hash,
    'link-type': 'NAME_RECORD_SET',
  };
  // console.log('add-link payload => %o', root_node_link);
  // attempt to post payload to ship
  response = await fetch(
    `/spider/realm/passport-action/passport-vent/passport-vent`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        'add-link': root_node_link,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.json();
}

export function generateDeviceWallet() {
  const mnemonic = generateMnemonic(english);
  const wallet = Wallet.fromMnemonic(mnemonic);
  return wallet;
}

export function recoverDeviceWallet(mnemonic: string) {
  return Wallet.fromMnemonic(mnemonic);
}

/**
 * Add a new device (wallet / address) to the ship as a PASSPORT_ROOT.
 *
 * @param shipUrl
 * @param entity
 * @param mnemonic
 * @returns
 */
export async function addDevice(privateKey: string) {
  const wallet = new Wallet(privateKey);
  let response = await fetch(
    `/~/scry/passport/template/next-block/metadata-or-root.json`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const metadata: any = await response.json();

  // if the link-id returned from the API is not PASSPORT_ROOT, something
  //   is severely wrong
  if (!(metadata['link-id'] === 'PASSPORT_ROOT')) {
    console.error(
      'error: adding new device, but template block is not type PASSPORT_ROOT'
    );
    return;
  }

  const val = metadata['pki-state']['address-to-entity'].FILL_IN;
  metadata['pki-state']['address-to-entity'] = {
    [wallet.address]: val,
  };

  const nonce = metadata['pki-state']['address-to-nonce'].FILL_IN;
  metadata['pki-state']['address-to-nonce'] = {
    [wallet.address]: nonce,
  };

  metadata['pki-state']['entity-to-addresses'][val] = [wallet.address];

  metadata['sig-chain-settings']['signing-key'] = wallet.address;
  metadata['timestamp'] = Number(new Date().getTime());

  // const root = generateEpochPassportNode(entity, signingPublicKey);
  const data_string = JSON.stringify(metadata);
  const calculated_hash = await ethers.utils.sha256(
    ethers.utils.toUtf8Bytes(data_string)
  );
  const signed_hash = await wallet.signMessage(calculated_hash);
  const root_node_link = {
    data: data_string,
    hash: calculated_hash,
    'signature-of-hash': signed_hash,
    'link-type': 'PASSPORT_ROOT',
    'wallet-source': 'account',
  };

  console.log(
    JSON.stringify({
      'add-link': root_node_link,
    })
  );

  // attempt to post payload to ship
  response = await fetch(
    `/spider/realm/passport-action/passport-vent/passport-vent`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        'add-link': root_node_link,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.json();
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

/**
 * Add a new signed wallet / address to the ship as a SIGNED_KEY_ADD.
 *
 * @param shipUrl
 * @param entity
 * @param mnemonic
 * @returns
 */
export async function addWallet(
  deviceWallet: Wallet,
  wallet: any,
  walletName: string,
  walletAddress: `0x${string}`
) {
  let response = await fetch(
    `/~/scry/passport/template/next-block/metadata-or-root.json`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const metadata = await response.json();

  const nonce = getRandomInt(1, 1000);
  const timestamp = Number(new Date().getTime());
  const message = `${metadata['from-entity']} owns ${walletAddress}, ${nonce}, ${timestamp}`;
  const keysig = await wallet.signMessage({
    account: walletAddress,
    message: message,
  });

  const payload = {
    'link-metadata': {
      ...metadata,
      // timestamp: Number(new Date().getTime()),
      'signing-address': deviceWallet.address,
      'link-id': 'SIGNED_KEY_ADD',
    },
    'link-data': {
      address: walletAddress,
      'address-type': walletName,
      'entity-name': metadata['from-entity'],
      'key-signature': keysig,
      timestamp: timestamp,
      nonce: nonce,
    },
  };

  // const root = generateAddressAddKey(entity, deviceSigningKey, walletAddress);
  const data_string = JSON.stringify(payload);
  const calculated_hash = await ethers.utils.sha256(
    ethers.utils.toUtf8Bytes(data_string)
  );
  const signed_hash = await deviceWallet.signMessage(calculated_hash);

  const root_node_link = {
    data: data_string,
    hash: calculated_hash,
    'signature-of-hash': signed_hash,
    'link-type': 'SIGNED_KEY_ADD',
  };

  console.log(
    JSON.stringify({
      'add-link': root_node_link,
    })
  );

  // console.log('add-link payload => %o', root_node_link);
  // attempt to post payload to ship
  response = await fetch(
    `/spider/realm/passport-action/passport-vent/passport-vent`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        'add-link': root_node_link,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.json();
}

export async function encryptWallet(privateKey: string) {
  const wallet = new Wallet(privateKey);

  const response = await fetch(`/~/scry/profile/pwd.json`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const pwd = await response.json();

  return wallet.encrypt(pwd);
}

export async function decryptWallet(encryptedDeviceData: string) {
  const response = await fetch(`/~/scry/profile/pwd.json`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const pwd = await response.json();
  const wallet = await Wallet.fromEncryptedJson(encryptedDeviceData, pwd);
  return wallet;
}
