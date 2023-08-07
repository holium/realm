import { useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';
import { SiweMessage } from 'siwe';
import { thirdEarthApi } from 'thirdEarthApi';

import { Button, Text } from '@holium/design-system/general';

import { hostingHrefs } from '../constants';

const createSiweMessage = (nonce: string, address: string) => {
  const message = new SiweMessage({
    nonce,
    address,
    statement: 'Sign in to Holium',
    domain: window.location.host,
    uri: window.location.origin,
    version: '1',
    chainId: 1,
  });

  return message.prepareMessage();
};

export const ConnectWalletButton = () => {
  const [provider, setProvider] = useState<BrowserProvider>();

  const signInWithEthereum = async () => {
    if (!provider) return;

    let nonce = '';
    try {
      const nonceResponse = await thirdEarthApi.getNonce();
      if (!nonceResponse.nonce) return;
      nonce = nonceResponse.nonce;
    } catch (error) {
      console.error(error);
      return;
    }

    let message = '';
    let signature = '';
    try {
      const signer = await provider.getSigner();
      message = createSiweMessage(nonce, signer.address);
      signature = await signer.signMessage(message);
    } catch (error) {
      console.error(error);
      return;
    }

    const loginPayload = { message, signature };
    const loginResponse = await thirdEarthApi.loginWithWallet(loginPayload);

    if (loginResponse.token) {
      const redirectUrl = new URL(hostingHrefs.CREATE_ACCOUNT_WITH_WALLET);
      redirectUrl.searchParams.append('token', loginResponse.token);
      window.location.href = redirectUrl.toString();
    }
  };

  useEffect(() => {
    if ((window as any).ethereum && !provider) {
      const newProvider = new BrowserProvider((window as any).ethereum);
      setProvider(newProvider);
    }
  });

  return (
    <Button.Primary onClick={signInWithEthereum}>
      <Text.Body color="text" fontWeight={500}>
        Connect Wallet
      </Text.Body>
    </Button.Primary>
  );
};
