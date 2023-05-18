import { Flex, Text } from '@holium/design-system/general';

import {
  ERC20Type,
  WalletNavOptions,
} from 'renderer/stores/models/wallet.model';

import { WalletScreen } from '../../types';
import { Coin } from './Coin';

type Props = {
  coins: ERC20Type[];
  navigate: (view: WalletScreen, options?: WalletNavOptions) => void;
};

export const CoinList = ({ coins, navigate }: Props) => {
  if (!coins.length) {
    return <Text.H5>No coins</Text.H5>;
  }

  return (
    <Flex gap={4} flexDirection="column" alignItems="center">
      {coins.map((coin, index) => (
        <Coin
          key={index}
          coin={coin}
          onClickCoin={(address: string) => {
            navigate(WalletScreen.WALLET_DETAIL, {
              detail: {
                type: 'coin',
                txtype: 'coin',
                coinKey: address,
                key: address,
              },
            });
          }}
        />
      ))}
    </Flex>
  );
};
