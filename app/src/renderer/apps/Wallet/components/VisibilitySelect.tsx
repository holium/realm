import { Flex } from '@holium/design-system/general';
import { Select } from '@holium/design-system/inputs';

import {
  SharingMode,
  WalletCreationMode,
} from 'os/services/ship/wallet/wallet.types';

type WalletVisibility = 'anyone' | 'friends' | 'nobody';

type Wallets = { nickname: string; index: number }[];

type Props = {
  sharingMode: SharingMode;
  defaultIndex: number;
  walletCreationMode: WalletCreationMode;
  wallets: Wallets;
  onChange: (mode: WalletVisibility | SharingMode, index?: number) => void;
};

export const VisibilitySelect = ({
  sharingMode,
  defaultIndex,
  walletCreationMode,
  wallets,
  onChange,
}: Props) => {
  const visibilityOptions = [
    { label: 'Anybody', value: SharingMode.ANYBODY },
    { label: 'Friends only', value: SharingMode.FRIENDS },
    { label: 'Nobody', value: SharingMode.NOBODY },
  ];
  const sharedWalletOptions = wallets.map((wallet) => ({
    label: wallet.nickname,
    value: wallet.index.toString(),
  }));

  function visibilityChange(newVisibility: string) {
    ['anyone', 'friends'].includes(newVisibility)
      ? onChange(newVisibility as WalletVisibility, defaultIndex)
      : onChange(newVisibility as WalletVisibility);
  }

  return (
    <>
      <Flex width="140px">
        <Select
          id="wallet-visibility"
          options={visibilityOptions}
          selected={sharingMode}
          onClick={visibilityChange}
        />
      </Flex>
      <Flex mt={1} width="220px">
        {['anyone', 'friends'].includes(sharingMode) &&
          walletCreationMode !== WalletCreationMode.ON_DEMAND && (
            <Select
              id="wallet-default"
              options={sharedWalletOptions}
              selected={defaultIndex.toString() || Number(0).toString()}
              onClick={(newAddress) =>
                onChange(sharingMode, Number(newAddress))
              }
            />
          )}
      </Flex>
    </>
  );
};
