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
} from '../../../lib/helpers';
import { TransactionList } from '../Transaction/List';
import { SendTransaction } from '../Transaction/Send';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { ERC20Type, WalletView } from 'os/services/tray/wallet.model';

// const coins = [
//   {
//     ticker: 'USDC',
//     amount: '5765.2',
//     icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
//   },
//   {
//     ticker: 'BNB',
//     amount: '1.1000',
//     icon: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Binance-Coin-BNB-icon.png'
//   },
//   {
//     ticker: 'SHIB',
//     amount: '21300000',
//     icon: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png'
//   },
//   {
//     ticker: 'UNI',
//     amount: '211',
//     icon: 'https://cryptologos.cc/logos/uniswap-uni-logo.png'
//   }
// ]

interface CoinListProps {
  coins: ERC20Type[]
}

export const CoinList: FC<CoinListProps> = (props: CoinListProps) => {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);

  const Coin = (props: { details: ERC20Type }) => {
    return (
      <Flex width="100%" my="2px" px={3} py={2} alignItems="center" justifyContent="space-between" backgroundColor={darken(.03, theme.currentTheme.windowColor)} borderRadius="6px"
        onClick={() => WalletActions.setView(WalletView.WALLET_DETAIL, undefined, { type: 'coin', key: props.details.address})}>
        <Flex alignItems="center">
          <img style={{ marginRight: '12px' }} height="20px" src={props.details.logo} />
          <Flex flexDirection="column" justifyContent="center">
            <Text variant="body"> {props.details.balance} {props.details.name} </Text>
            <Text fontSize={1} color={baseTheme.colors.text.disabled}>$5780.67</Text>
          </Flex>
        </Flex>
        <Icons name="ChevronRight" color={theme.currentTheme.iconColor} height={20} />
      </Flex>
    )
  }

  return (
    <Flex flexDirection="column" alignItems="center">
      {props.coins.map((coin, index) => <Coin details={coin} key={index} />)}
    </Flex>
  )
}
