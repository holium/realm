import { FC } from 'react';

import { Row, Flex, Text, Icons } from 'renderer/components';
import { getMockCoinIcon, formatCoinAmount } from '../../../lib/helpers';
import { ERC20Type, WalletView } from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

interface CoinListProps {
  coins: ERC20Type[];
}

export const CoinList: FC<CoinListProps> = (props: CoinListProps) => {
  const Coin = (props: { details: ERC20Type }) => {
    const { walletStore } = useShipStore();
    const coinIcon = props.details.logo || getMockCoinIcon(props.details.name);
    const amount = formatCoinAmount(
      props.details.balance,
      props.details.decimals
    );
    return (
      <Row
        onClick={async () => {
          await walletStore.navigate(WalletView.WALLET_DETAIL, {
            detail: {
              type: 'coin',
              txtype: 'coin',
              coinKey: props.details.address,
              key: props.details.address,
            },
          });
        }}
      >
        <Flex width="100%" alignItems="center" justifyContent="space-between">
          <Flex alignItems="center">
            <img
              style={{ marginRight: '12px' }}
              height="20px"
              width="20px"
              src={coinIcon}
            />
            <Flex flexDirection="column" justifyContent="center">
              <Text variant="body">
                {' '}
                {amount.display} {props.details.name}{' '}
              </Text>
            </Flex>
          </Flex>
          <Icons name="ChevronRight" height={20} />
        </Flex>
      </Row>
    );
  };

  return (
    <Flex gap={4} flexDirection="column" alignItems="center">
      {props.coins.length ? (
        props.coins.map((coin, index) => <Coin details={coin} key={index} />)
      ) : (
        <Text mt={6} variant="h5" textAlign="center">
          No Coins
        </Text>
      )}
    </Flex>
  );
};
