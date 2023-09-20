'use client';
import { useEffect, useState } from 'react';
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import {
  configureChains,
  createConfig,
  useAccount,
  useWalletClient,
  WagmiConfig,
} from 'wagmi';
import { arbitrum, mainnet } from 'wagmi/chains';
import { Network, Alchemy, OwnedNftsResponse } from 'alchemy-sdk';

import { PlusIcon } from '@/app/assets/icons';
// import "../styles.css";
import { shipUrl } from '@/app/lib/shared';
import { createEpochPassportNode } from '@/app/lib/wallet';
import { PassportProfile } from '@/app/lib/types';

const chains = [arbitrum, mainnet];
const projectId = 'f8134a8b6ecfbef24cfd151795e94b5c';

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: 'YVJ7LV7w8esHG18rdnKSERfN_OcyJWY_', // Replace with your Alchemy API Key.
  network: Network.ETH_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

function PassportEditor() {
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const { address /*isConnected */ } = useAccount({
    // @ts-ignore
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected });
    },
  });
  const onSaveClick = (e: any) => {
    e.preventDefault();
  };
  useEffect(() => {
    if (isError) {
      console.error('error loading wallet client');
      return;
    }
    if (address && !isLoading) {
      createEpochPassportNode(shipUrl, walletClient, address)
        .then((result) =>
          console.log('createEpochPassportNode response => %o', result)
        )
        .catch((e) => console.error(e));
      alchemy.nft
        .getNftsForOwner(address)
        .then((meta: OwnedNftsResponse) => console.log(meta));
    }
  }, [address, walletClient, isError, isLoading]);
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '400px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            textDecoration: 'underline',
            color: '#4292F1',
            cursor: 'default',
          }}
          onClick={onSaveClick}
        >
          Save
        </div>
        <>
          <div style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                marginTop: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#333333',
                  opacity: '0.4',
                }}
              >
                Display name
              </div>
              <hr
                style={{
                  // color: '#333333',
                  marginLeft: '8px',
                  backgroundColor: '#333333',
                  width: '100%',
                  height: '1px',
                  border: 0,
                  opacity: '10%',
                }}
              />
            </div>
            <div
              style={{
                color: '#333333',
                marginTop: '4px',
                marginBottom: '8px',
              }}
            ></div>
          </div>
          <div style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                marginTop: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#333333',
                  opacity: '0.4',
                  whiteSpace: 'nowrap',
                  lineHeight: '22px',
                }}
              >
                Bio
              </div>
              <hr
                style={{
                  // color: '#333333',
                  marginLeft: '8px',
                  backgroundColor: '#333333',
                  width: '100%',
                  height: '1px',
                  border: 0,
                  opacity: '10%',
                }}
              />
            </div>
            <div
              style={{
                color: '#333333',
                paddingTop: '4px',
                paddingBottom: '4px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: '8px',
                  backgroundColor: '#EFF2F4',
                  padding: '8px',
                  gap: '8px',
                  lineHeight: '20px',
                }}
              ></div>
            </div>
          </div>
          <div style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                paddingTop: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#333333',
                  opacity: '0.4',
                  whiteSpace: 'nowrap',
                  lineHeight: '22px',
                }}
              >
                NFTs
              </div>
              <hr
                style={{
                  // color: '#333333',
                  marginLeft: '8px',
                  backgroundColor: '#333333',
                  width: '100%',
                  height: '1px',
                  border: 0,
                  opacity: '10%',
                }}
              />
            </div>
            <div
              style={{
                color: '#333333',
                paddingTop: '4px',
                paddingBottom: '4px',
              }}
            >
              <div
                style={{
                  width: '115px',
                  height: '115px',
                  borderRadius: '8px',
                  backgroundColor: '#F2F7FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PlusIcon />
              </div>
            </div>
          </div>
          <div style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                paddingTop: '8px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#333333',
                  opacity: '0.4',
                  whiteSpace: 'nowrap',
                  lineHeight: '22px',
                }}
              >
                Linked addresses
              </div>
              <hr
                style={{
                  // color: '#333333',
                  marginLeft: '8px',
                  backgroundColor: '#333333',
                  width: '100%',
                  height: '1px',
                  border: 0,
                  opacity: '10%',
                }}
              />
            </div>
            <div
              style={{
                color: '#333333',
                paddingTop: '4px',
                paddingBottom: '4px',
              }}
            ></div>
          </div>
        </>
      </div>
    </div>
  );
}

// @ts-ignore
export default function Home() {
  const [passport, setPassport] = useState<PassportProfile | null>(null);
  // const { open } = useWeb3Modal();

  // useEffect(() => {
  //   if (
  //     window.__INITIAL_STATE__.discoverable &&
  //     window.__INITIAL_STATE__.passport_api_key
  //   ) {
  //     // get our passport from the publicly facing ship API. this is
  //     //   different than the %passport API which gives much more detailed information.
  //     //  the public version only gives the bare minimum data necessary to
  //     //   render the UI
  //     fetch(
  //       `${shipUrl}/~/scry/profile/${window.__INITIAL_STATE__.passport_api_key}.json`,
  //       {
  //         method: 'GET',
  //         credentials: 'include',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       }
  //     )
  //       .then((response) => response.json())
  //       .then((data: PassportProfile) => {
  //         console.log(data);
  //         // parse the cookie and extract the ship name. if the ship
  //         //  name in the cookie matches the ship name returned by the our-passport.json
  //         //  call, enable edit functionality
  //         if (document.cookie) {
  //           const pairs = document.cookie.split(';');
  //           for (let i = 0; i < pairs.length; i++) {
  //             const pair = pairs[i].split('=');
  //             const key = pair[0].trim();
  //             if (key === `urbauth-${data.contact?.ship}`) {
  //               // setCanEdit(true);
  //               break;
  //             }
  //           }
  //         }
  //         setPassport(data);
  //       })
  //       .catch((e) => {
  //         console.error(e);
  //         // setPageMode('error');
  //       });
  //   } else {
  //     // setPageMode('incognito');
  //   }
  // }, []);

  return (
    <>
      {passport ? (
        <WagmiConfig config={wagmiConfig}>
          <>
            <PassportEditor />
          </>
        </WagmiConfig>
      ) : null}

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
