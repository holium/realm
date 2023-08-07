import { useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';
import { SiweMessage } from 'siwe';
import { thirdEarthApi } from 'thirdEarthApi';

import { Button, Text } from '@holium/design-system/general';

const createSiweMessage = (
  nonce: string,
  address: string,
  statement: string
) => {
  const message = new SiweMessage({
    nonce,
    address,
    statement,
    domain: window.location.host,
    uri: window.location.origin,
    version: '1',
    chainId: 1,
  });

  return message.prepareMessage();
};

export const ConnectWalletButton = () => {
  const [provider, setProvider] = useState<BrowserProvider>();

  async function signInWithEthereum() {
    if (!provider) return;

    const nonceResponse = await thirdEarthApi.getNonce();
    if (!nonceResponse.nonce) return;

    const signer = await provider.getSigner();
    const message = createSiweMessage(
      nonceResponse.nonce,
      signer.address,
      'Sign in with Ethereum to the app.'
    );
    const signature = await signer.signMessage(message);

    const loginPayload = { message, signature };
    console.log('logging in...', loginPayload);
    const loginResponse = await thirdEarthApi.loginWithWallet(loginPayload);

    if (loginResponse.token) {
      // Redirect to hosting.holium.com
      window.location.href = `https://hosting.holium.com?token=${loginResponse.token}`;
    }
  }

  useEffect(() => {
    if ((window as any).ethereum && !provider) {
      const newProvider = new BrowserProvider((window as any).ethereum);
      setProvider(newProvider);
    }
  }, []);

  return (
    <Button.Primary onClick={signInWithEthereum}>
      <Text.Body color="text" fontWeight={500}>
        Connect Wallet
      </Text.Body>
    </Button.Primary>
  );
};
