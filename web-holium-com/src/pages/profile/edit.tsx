import { useEffect, useState } from 'react';
import { useWeb3Modal } from '@web3modal/react';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';

import { createEpochPassportNode } from 'lib/wallet';

interface ProfilePageProps {
  canEdit: boolean;
}

export default function EditProfilePage({ canEdit }: ProfilePageProps) {
  const { open } = useWeb3Modal();
  const { data: walletClient, isError, isLoading } = useWalletClient();
  const { address, isConnected } = useAccount({
    // @ts-ignore
    onConnect({ address, connector, isReconnected }) {
      console.log('Connected', { address, connector, isReconnected });
    },
  });
  const { disconnect } = useDisconnect();

  const [editing, setEditing] = useState<boolean>(false);
  const onClickEdit = () => {
    setEditing(true);
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
    }
  }, [isError, isLoading]);

  return (
    <>
      <h1>This is the profile page</h1>
      {canEdit && <button onClick={onClickEdit}>Edit</button>}
    </>
  );
}
