import { Flex } from '@holium/design-system/general';

import { MenuButton } from './MenuButton';

export type WalletTab = 'coins' | 'nfts' | 'transactions';

type Props = {
  selected: WalletTab;
  network: string;
  onSelect: (t: WalletTab) => void;
};

export const WalletTabMenu = ({ selected, network, onSelect }: Props) => (
  <Flex alignItems="center" gap="4px">
    {network === 'ethereum' && (
      <MenuButton
        selected={selected === 'coins'}
        onClick={() => onSelect('coins')}
      >
        Coins
      </MenuButton>
    )}
    {network === 'ethereum' && (
      <MenuButton
        selected={selected === 'nfts'}
        onClick={() => onSelect('nfts')}
      >
        NFTs
      </MenuButton>
    )}
    <MenuButton
      selected={selected === 'transactions'}
      onClick={() => onSelect('transactions')}
    >
      Transactions
    </MenuButton>
  </Flex>
);
