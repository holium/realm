import { useWeb3Modal } from '@web3modal/react';
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { useEffect, useState } from 'react';
import {
  configureChains,
  createConfig,
  useAccount,
  useWalletClient,
  WagmiConfig,
} from '@wagmi/core';
import { mainnet, optimism, polygon } from '@wagmi/core/chains';
// import "../styles.css";

import { shipUrl } from '@/app/lib/shared';
import { createEpochPassportNode } from '@/app/lib/wallet';

const projectId = 'f8134a8b6ecfbef24cfd151795e94b5c';

// 2. Configure wagmi client
const chains = [mainnet, polygon, optimism];

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ chains, projectId }),
  publicClient,
});

// 3. Configure modal ethereum client
const ethereumClient = new EthereumClient(wagmiConfig, chains);

// 4. Wrap your app with WagmiProvider and add <Web3Modal /> compoennt
// @ts-ignore
export default function Home({ Component, pageProps }) {
  const [ready, setReady] = useState(false);
  const { open } = useWeb3Modal();
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const { address /*isConnected */ } = useAccount({
    // @ts-ignore
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected });
    },
  });

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
  }, [isError, isLoading]);

  return (
    <>
      {ready ? (
        <WagmiConfig config={wagmiConfig}>
          <>
            <h1>This is the profile page</h1>
          </>
        </WagmiConfig>
      ) : null}

      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}
