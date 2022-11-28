import { FC } from 'react';
import { darken } from 'polished';

import { Flex, Text, Icons } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import {
  getBaseTheme,
  getMockCoinIcon,
  formatCoinAmount,
} from '../../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { ERC20Type, WalletView } from 'os/services/tray/wallet.model';

interface CoinListProps {
  coins: ERC20Type[];
}

export const CoinList: FC<CoinListProps> = (props: CoinListProps) => {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);

  const Coin = (props: { details: ERC20Type }) => {
    const coinIcon = props.details.logo || getMockCoinIcon(props.details.name);
    const amount = formatCoinAmount(
      props.details.balance,
      props.details.decimals
    );
    return (
      <Flex
        width="100%"
        my="2px"
        px={3}
        py={2}
        alignItems="center"
        justifyContent="space-between"
        backgroundColor={darken(0.03, theme.currentTheme.windowColor)}
        borderRadius="6px"
        onClick={async () =>
          await WalletActions.navigate(WalletView.WALLET_DETAIL, {
            detail: { type: 'coin', key: props.details.address },
          })
        }
      >
        <Flex alignItems="center">
          <img style={{ marginRight: '12px' }} height="20px" src={coinIcon} />
          <Flex flexDirection="column" justifyContent="center">
            <Text variant="body">
              {' '}
              {amount.display} {props.details.name}{' '}
            </Text>
            {/* <Text fontSize={1} color={baseTheme.colors.text.disabled}>
              $5780.67
      </Text> */}
          </Flex>
        </Flex>
        <Icons
          name="ChevronRight"
          color={theme.currentTheme.iconColor}
          height={20}
        />
      </Flex>
    );
  };

  return (
    <Flex flexDirection="column" alignItems="center">
      {props.coins.length ? (
        props.coins.map((coin, index) => <Coin details={coin} key={index} />)
      ) : (
        <Text
          mt={3}
          variant="h4"
          textAlign="center"
          color={theme.currentTheme.iconColor}
        >
          No Coins
        </Text>
      )}
    </Flex>
  );
};
