import { useWeb3Modal } from "@web3modal/react";
import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useWalletClient } from "wagmi";

import { createEpochPassportNode } from "lib/wallet";

const shipUrl = 'http://localhost';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const { open } = useWeb3Modal();
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const { address, isConnected } = useAccount({
    // @ts-ignore
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected });
      // if ( isError ) {
      //   console.error('account.onConnect: wallet client error')
      //   return;
      // }
      // if (isLoading) {
      //   console.log('account.onConnect: wallet client loading')
      //   return;
      // }
      // if ( address ) {
      //   createEpochPassportNode(shipUrl, walletClient, address)
      //   .then((result) =>
      //     console.log('createEpochPassportNode response => %o', result)
      //   )
      //   .catch((e) => console.error(e));
      // } else {
      //   console.warn('account.onConnect: address is undefined')
      // }
    },
  });
  const { disconnect } = useDisconnect();
  const label = isConnected ? "Disconnect" : "Connect Custom";

  useEffect(() => {
    if ( isError ) {
      console.error('error loading wallet client');
      return;
    }
    if ( address && !isLoading ) {
      createEpochPassportNode(shipUrl, walletClient, address)
      .then((result) =>
        console.log('createEpochPassportNode response => %o', result)
      )
      .catch((e) => console.error(e));
    }
  }, [isError, isLoading])
  async function onOpen() {
    setLoading(true);
    await open();
    setLoading(false);
  }

  function onClick() {
    if (isConnected) {
      disconnect();
    } else {
      onOpen();
    }
  }

  return (
    <button onClick={onClick} disabled={loading}>
      {loading ? "Loading..." : label}
    </button>
  );
}