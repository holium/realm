import React, { FC, useEffect, useState } from 'react';
import { isValidPatp} from 'urbit-ob';
import { errors, ethers } from 'ethers';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { theme as themes } from 'renderer/theme';
import { darken, lighten } from 'polished';
import {QRCodeSVG} from 'qrcode.react';

import { Flex, Box, Icons, Text, Sigil, Button, ImagePreview } from 'renderer/components';
import { CircleButton } from '../../../components/CircleButton';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { shortened, formatWei, convertWeiToUsd, monthNames, getBaseTheme } from '../../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { BitcoinWalletType, EthWalletType, WalletStoreType } from 'os/services/tray/wallet.model';
import { RecipientPayload } from 'os/services/tray/wallet.service';
import { transaction } from 'mobx';

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

interface PendingTransactionDisplayProps {
  transactions: TransactionType[]
}
export const PendingTransactionDisplay: FC<PendingTransactionDisplayProps> = (props: PendingTransactionDisplayProps) => {
  const pendingTransactions = props.transactions
    .filter((trans) => trans.status === 'pending')
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Flex mt={4} width="100%">
      {pendingTransactions.length
        ? <PendingTransaction transaction={pendingTransactions[0]} />
        : <></>
      }
    </Flex>
  )
}

interface PendingTransactionProps {
  transaction: TransactionType
}
export const PendingTransaction: FC<PendingTransactionProps> = (props: PendingTransactionProps) => {
  const { desktop } = useServices();
  const { colors } = getBaseTheme(desktop);

  return (
    <Flex p="8px" width="100%" justifyContent="space-between" background="#F3F3F3">
      <Flex flexDirection="column">
        <Text variant="body" color={colors.brand.primary}>
          {props.transaction.type === 'sent' ? 'Sending' : 'Receiving'} {props.transaction.amount} {abbrMap[props.transaction.network]}
        </Text>
        <Text variant="body" color={colors.text.secondary} fontSize={1}>
          {props.transaction.type === 'sent' ? 'To:' : 'From:'} {props.transaction.address} <Icons ml="7px" name="ShareBox" size="15px" />
        </Text>
      </Flex>
    </Flex>
  )
}
