import { FC } from 'react';
import { darken } from 'polished';

import { Flex, Text, Icons } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { getMockCoinIcon, formatCoinAmount } from '../../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import {
  ERC20Type,
  WalletView,
} from 'os/services/tray/wallet-lib/wallet.model';
import { Row } from 'renderer/components/NewRow';

interface CoinListProps {
  coins: ERC20Type[];
}

export const CoinList: FC<CoinListProps> = (props: CoinListProps) => {
  const { theme } = useServices();

  const Coin = (props: { details: ERC20Type }) => {
    const coinIcon = props.details.logo || getMockCoinIcon(props.details.name);
    const amount = formatCoinAmount(
      props.details.balance,
      props.details.decimals
    );
    return (
      <Row
        baseBg={darken(0.03, theme.currentTheme.windowColor)}
        customBg={darken(0.0325, theme.currentTheme.windowColor)}
        onClick={async () => {
          await WalletActions.navigate(WalletView.WALLET_DETAIL, {
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
          <Icons
            name="ChevronRight"
            color={theme.currentTheme.iconColor}
            height={20}
          />
        </Flex>
      </Row>
    );
  };

  return (
    <Flex gap={4} flexDirection="column" alignItems="center">
      {props.coins.length ? (
        props.coins.map((coin, index) => <Coin details={coin} key={index} />)
      ) : (
        <Text
          mt={6}
          variant="h5"
          textAlign="center"
          color={theme.currentTheme.iconColor}
        >
          No Coins
        </Text>
      )}
    </Flex>
  );
};
