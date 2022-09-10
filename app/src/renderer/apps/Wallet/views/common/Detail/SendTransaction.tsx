import { FC, useState } from 'react';
import { isValidPatp} from 'urbit-ob';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { theme as themes } from 'renderer/theme';
import { darken, lighten } from 'polished';
import {QRCodeSVG} from 'qrcode.react';

import { Flex, Box, Icons, Text, Sigil, Button } from 'renderer/components';
import { CircleButton } from '../../../components/CircleButton';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { shortened, formatWei, convertWeiToUsd, monthNames, getBaseTheme } from '../../../lib/helpers';

import { WalletInfo } from './WalletInfo';
import { TransactionPane } from './TransactionPane';

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

interface SendTransactionProps {
  hidden: boolean
  onScreenChange: any
  close: () => void
}

export const SendTransaction: FC<SendTransactionProps> = observer((props: SendTransactionProps) => {
  const { desktop } = useServices();
  const { walletApp } = useTrayApps();
  const theme = getBaseTheme(desktop);
const Seperator = () => (
  <Flex mt={6} position="relative" width="100%" justifyContent="center">
    <Box position="absolute" width="300px" height="1px" left="-10px" background={theme.colors.bg.primary} />
    <Flex position="absolute" bottom="-12px" height="25px" width="80px" justifyContent="center" alignItems="center" borderRadius="50px" background={desktop.theme.mode === 'light' ? '#EAF3FF' : '#262f3b'}>
      <Text variant="body" color={theme.colors.brand.primary}>Send {abbrMap[walletApp.network as 'bitcoin' | 'ethereum']}</Text>
    </Flex>
  </Flex>
)

return (
  <Box width="100%" hidden={props.hidden}>
    <Seperator />
    <TransactionPane max={4} onScreenChange={props.onScreenChange} close={props.close} />
  </Box>
)
});
