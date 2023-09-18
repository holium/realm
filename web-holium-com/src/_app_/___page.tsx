// import { useEffect, useState } from 'react';
// import {
//   EthereumClient,
//   w3mConnectors,
//   w3mProvider,
// } from '@web3modal/ethereum';
// import { useWeb3Modal, Web3Modal } from '@web3modal/react';

// import {
//   configureChains,
//   createConfig,
//   useAccount,
//   // useConfig,
//   // useWalletClient,
//   WagmiConfig,
// } from 'wagmi';
// // import { arbitrum, mainnet, polygon } from 'wagmi/chains';

// import { ethers } from 'ethers';
// import { sepolia } from 'viem/chains';

// import { ProfileCard } from './profile';
// import { EPOCH_NODE_POC, PassportProfile } from './types';

// // types deduced from Figma
// // https://www.figma.com/file/vgKKJDctScyxbPxFdXwgIQ/Phase-2
// //  page: 'Courier - mobile'

// const chains = [sepolia];
// const projectId = 'f8134a8b6ecfbef24cfd151795e94b5c';

// const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

// const wagmiConfig = createConfig({
//   autoConnect: true,
//   connectors: w3mConnectors({ projectId, chains }),
//   publicClient,
// });

// const ethereumClient = new EthereumClient(wagmiConfig, chains);

// // const passport: PassportProfile = {
// //   contact: {
// //     patp: '~lomder-librun',
// //     avatar: {
// //       source: 'image',
// //       uri: 'https://lomder-librun.sfo3.digitaloceanspaces.com/Images/~lomder-librun/1688123194-future-roman.png',
// //     },
// //     color: null,
// //     displayName: 'DrunkPlato',
// //     // trent suggested moving bio into contact card
// //     bio: 'A man with a plan',
// //   },
// //   status: 'online',
// //   discoverable: false,
// //   nfts: [],
// //   addresses: [],
// //   defaultAddress: '0x12345',
// //   recommendations: [],
// //   chain: '0x99999',
// // };

// const generateEpochPassportNode = (
//   signingPublicKey: string
// ): EPOCH_NODE_POC => {
//   const entity = 'passport_root';
//   const root_node_data: EPOCH_NODE_POC = {
//     link_id: 'PASSPORT_ROOT',
//     epoch_block_number: 0,
//     data_block_number: 0,
//     timestamp: Number(new Date().getTime()),
//     previous_epoch_hash: '0x00000000000000000000000000000000',
//     pki_state: {
//       chain_owner_entities: [entity],
//       entity_to_public_keys: {
//         [entity]: [signingPublicKey],
//       },
//       public_key_to_nonce: {
//         [signingPublicKey]: 0,
//       },
//       entity_to_value: {
//         [entity]: 1728,
//       },
//       public_key_to_entity: {
//         [signingPublicKey]: entity,
//       },
//     },
//     transaction_types: {
//       link_names: [
//         'ENTITY_ADD',
//         'ENTITY_REMOVE',
//         'KEY_ADD',
//         'KEY_REMOVE',
//         'NAME_RECORD_SET',
//       ],
//       link_structs: '',
//     },
//     data_structs: {
//       struct_names: ['NAME_RECORD'],
//       struct_types: '',
//     },
//     sig_chain_settings: {
//       new_entity_balance: 0,
//       epoch_length: 0,
//       signing_key: signingPublicKey,
//     },
//   };
//   return root_node_data;
// };

// async function createEpochPassportNode(wallet: any, signingPublicKey: string) {
//   const root = generateEpochPassportNode(signingPublicKey);
//   const data_string = JSON.stringify(root);
//   const calculated_hash = await ethers.utils.sha256(
//     ethers.utils.toUtf8Bytes(data_string)
//   );
//   const signed_hash = await wallet.signMessage(calculated_hash);
//   const root_node_link = {
//     data: data_string,
//     hash: calculated_hash,
//     signature_of_hash: signed_hash,
//     link_type: 'EPOCH_NODE_DEFAULT',
//   };
//   // attempt to post payload to ship
//   const url = `${shipUrl}/spider/realm/passport-action/passport-vent/passport-vent`;
//   const response = await fetch(url, {
//     method: 'POST',
//     credentials: 'include',
//     body: JSON.stringify(root_node_link),
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
//   return response.json();
// }

// const shipUrl = 'http://localhost';

// console.log('wagmi => %o', wagmiConfig);

// export default function Home() {
//   const { open } = useWeb3Modal();
//   // const { data: walletClient } = useWalletClient();
//   const account = useAccount({
//     // @ts-ignore
//     onConnect({ address, connector, isReconnected }) {
//       console.log('Connected', { address, connector, isReconnected });
//       // createEpochPassportNode(walletClient, address)
//       //   .then((result) =>
//       //     console.log('createEpochPassportNode response => %o', result)
//       //   )
//       //   .catch((e) => console.error(e));
//     },
//   });
//   const [profile, setProfile] = useState<PassportProfile | undefined>(
//     undefined
//   );

//   useEffect(() => {
//     fetch(`${shipUrl}/~/scry/passport/our-passport.json`, {
//       method: 'GET',
//       credentials: 'include',
//     })
//       .then((res: Response) => res.json())
//       .then((content: PassportProfile) => {
//         console.log('response => %o', content);
//         setProfile(content);
//       })
//       .catch((e) => console.error(e));
//   }, []);

//   if (!profile) {
//     return (
//       <div
//         style={{
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'center',
//           alignItems: 'center',
//           height: '100vh',
//         }}
//       >
//         Please wait. Loading profile...
//       </div>
//     );
//   }

//   return (
//     <>
//       <WagmiConfig config={wagmiConfig}>
//         <ProfileCard profile={profile} />
//       </WagmiConfig>
//       <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
//     </>
//   );
// }
