import { FC } from 'react';
import { Flex, Icon, Row, Text } from '@holium/design-system';
import { ERC20Type, WalletView } from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { formatCoinAmount, getMockCoinIcon } from '../../../lib/helpers';

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
              <Text.Body variant="body">
                {' '}
                {amount.display} {props.details.name}{' '}
              </Text.Body>
            </Flex>
          </Flex>
          <Icon name="ChevronRight" height={20} />
        </Flex>
      </Row>
    );
  };

  return (
    <Flex gap={4} flexDirection="column" alignItems="center">
      {props.coins.length ? (
        props.coins.map((coin, index) => <Coin details={coin} key={index} />)
      ) : (
        <Text.H5 mt={6} variant="h5" textAlign="center">
          No Coins
        </Text.H5>
      )}
    </Flex>
  );
};
