import { useState } from 'react';

import { Button, Text } from '@holium/design-system/general';

export const ConnectWalletButton = () => {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = async () => {
    if ((window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(accounts[0]);
      } catch (error: any) {
        alert(error.message);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  console.log(account);

  return (
    <Button.Primary onClick={connectWallet}>
      <Text.Body color="text" fontWeight={500}>
        Connect Wallet
      </Text.Body>
    </Button.Primary>
  );
};
