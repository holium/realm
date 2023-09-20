import { useEffect, useState } from 'react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react';
import { useAccount, useWalletClient, WagmiConfig } from 'wagmi';
import { arbitrum, mainnet } from 'wagmi/chains';

import { PlusIcon } from '@/app/assets/icons';
// import "../styles.css";
import { shipUrl } from '@/app/lib/shared';
import { createEpochPassportNode } from '@/app/lib/wallet';

const projectId = 'f8134a8b6ecfbef24cfd151795e94b5c';

const chains = [mainnet, arbitrum];
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  appName: 'Web3Modal',
});

// const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
// const wagmiConfig = createConfig({
//   autoConnect: true,
//   connectors: w3mConnectors({ chains, projectId }),
//   publicClient,
// });

// // 3. Configure modal ethereum client
// const ethereumClient = new EthereumClient(wagmiConfig, chains);

// 4. Wrap your app with WagmiProvider and add <Web3Modal /> compoennt
// @ts-ignore
export default function Home({ _Component, _pageProps }) {
  const [ready, setReady] = useState(false);
  // const { open } = useWeb3Modal();
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const { address /*isConnected */ } = useAccount({
    // @ts-ignore
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected });
    },
  });

  const onSaveClick = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    setReady(true);
  }, []);

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
    }
  }, [address, walletClient, isError, isLoading]);

  return (
    <>
      {ready ? (
        <WagmiConfig config={wagmiConfig}>
          <>
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
          </>
        </WagmiConfig>
      ) : null}

      {/* <Web3Modal projectId={projectId} ethereumClient={ethereumClient} /> */}
    </>
  );
}
