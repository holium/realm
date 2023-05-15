import { Flex } from '@holium/design-system/general';

import { MenuButton } from './MenuButton';

export type DisplayType = 'coins' | 'nfts' | 'transactions';

type Props = {
  selected: DisplayType;
  onChange: any;
  network: string;
};

export const ListSelector = ({ selected, onChange, network }: Props) => (
  <Flex alignItems="center">
    {network === 'ethereum' && (
      <MenuButton
        selected={selected === 'coins'}
        onClick={() => onChange('coins')}
      >
        Coins
      </MenuButton>
    )}
    {network === 'ethereum' && (
      <MenuButton
        selected={selected === 'nfts'}
        onClick={() => onChange('nfts')}
      >
        NFTs
      </MenuButton>
    )}
    <MenuButton
      selected={selected === 'transactions'}
      onClick={() => onChange('transactions')}
    >
      Transactions
    </MenuButton>
  </Flex>
);
