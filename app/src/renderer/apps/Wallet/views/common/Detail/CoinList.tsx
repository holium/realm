import { FC, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { darken, lighten } from 'polished';

import { Flex, Box, Text, Icons, TextButton } from 'renderer/components';
import { CircleButton } from '../../../components/CircleButton';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { ThemeModelType } from 'os/services/theme.model';
import {
  getBaseTheme,
  getTransactions,
  getMockCoinIcon,
  formatCoinAmount
} from '../../../lib/helpers';
import { TransactionList } from '../Transaction/List';
import { SendTransaction } from '../Transaction/Send';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { ERC20Type, WalletView } from 'os/services/tray/wallet.model';

interface CoinListProps {
  coins: ERC20Type[];
}

export const CoinList: FC<CoinListProps> = (props: CoinListProps) => {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);

  const Coin = (props: { details: ERC20Type }) => {
    let coinIcon = props.details.logo || getMockCoinIcon(props.details.name);
    let amount = formatCoinAmount(props.details.balance, props.details.decimals);
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
        onClick={() =>
          WalletActions.setView(WalletView.WALLET_DETAIL, undefined, {
            type: 'coin',
            key: props.details.address,
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
            {/*<Text fontSize={1} color={baseTheme.colors.text.disabled}>
              $5780.67
      </Text>*/}
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
      {props.coins.map((coin, index) => (
        <Coin details={coin} key={index} />
      ))}
    </Flex>
  );
};
