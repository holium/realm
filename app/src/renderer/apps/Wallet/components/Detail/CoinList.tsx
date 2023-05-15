import { Flex, Text } from '@holium/design-system/general';

import { ERC20Type } from 'renderer/stores/models/wallet.model';

import { Coin } from './Coin';

type Props = {
  coins: ERC20Type[];
};

export const CoinList = ({ coins }: Props) => (
  <Flex gap={4} flexDirection="column" alignItems="center">
    {coins.length ? (
      coins.map((coin, index) => <Coin key={index} details={coin} />)
    ) : (
      <Text.H5 mt={6} variant="h5" textAlign="center">
        No Coins
      </Text.H5>
    )}
  </Flex>
);
