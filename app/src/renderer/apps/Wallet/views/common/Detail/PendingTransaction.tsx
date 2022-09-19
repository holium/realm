import React, { FC, useEffect, useState } from 'react';
import { isValidPatp } from 'urbit-ob';
import { errors, ethers } from 'ethers';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { theme as themes } from 'renderer/theme';
import { darken, lighten } from 'polished';
import { QRCodeSVG } from 'qrcode.react';

import { Flex, Box, Icons, Text, Sigil, Button, ImagePreview, Spinner } from 'renderer/components';
import { CircleButton } from '../../../components/CircleButton';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { shortened, formatWei, convertWeiToUsd, monthNames, getBaseTheme, formatEthAmount, formatBtcAmount } from '../../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { BitcoinWalletType, EthWalletType, NetworkType, WalletStoreType, WalletView } from 'os/services/tray/wallet.model';
import { RecipientPayload } from 'os/services/tray/wallet.service';
import { transaction } from 'mobx';
import { TransactionType } from 'os/services/tray/wallet.model';

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

export interface TransactionType {
  hash: string
  amount: string
  network: 'ethereum' | 'bitcoin'
  type: 'sent' | 'received'

  initiatedAt: string | number  // timestamp
  completedAt?: string | number // timestamp

  ourAddress: string // actual address, path, w/e works
  theirPatp?: string
  theirAddress: string

  status: 'pending' | 'failed' | 'succeeded'
  failureReason?: string

  notes?: string
  link?: string // to etherscan or w/e, probs can just derive this given the hash
}

interface PendingTransactionDisplayProps {
  transactions: TransactionType[];
}
export const PendingTransactionDisplay: FC<PendingTransactionDisplayProps> = (
  props: PendingTransactionDisplayProps
) => {
  const pendingTransactions = props.transactions
    .filter((trans) => trans.status === 'pending')
    .sort((a, b) => (new Date(a.initiatedAt)).getTime() - (new Date(b.initiatedAt)).getTime());

  return (
    <Flex mt={4} width="100%">
      {pendingTransactions.length ? (
        <PendingTransaction transaction={pendingTransactions[0]} />
      ) : (
        <></>
      )}
    </Flex>
  );
};

interface PendingTransactionProps {
  transaction: TransactionType;
}
export const PendingTransaction: FC<PendingTransactionProps> = (
  props: PendingTransactionProps
) => {
  const { theme } = useServices();
  const { colors } = getBaseTheme(theme.currentTheme);

  const goToTransaction = () => {
    WalletActions.setView(WalletView.TRANSACTION_DETAIL, undefined, props.transaction.hash);
  };

  let isEth = props.transaction.network === 'ethereum';
  let ethAmount = formatEthAmount(isEth ? props.transaction.amount : '1')
  let btcAmount = formatBtcAmount(!isEth ? props.transaction.amount : '1')
  let themDisplay = props.transaction.theirPatp || shortened(props.transaction.theirAddress);

  return (
    <Flex mx={2} p={3} width="100%" justifyContent="space-between" background={desktop.theme.mode == 'light' ? darken(.04, desktop.theme.windowColor) : lighten(.02, desktop.theme.windowColor)} borderRadius="9px" onClick={goToTransaction}>
      <Flex flexDirection="column">
        <Text variant="body" color={colors.brand.primary}>
          { props.transaction.type === 'sent' ? 'Sending' : 'Receiving' } { isEth ? `${ethAmount.eth} ETH` : `${btcAmount.btc} BTC` }
        </Text>
        <Text pt={1} variant="body" color={colors.text.disabled} fontSize={1}>
          { props.transaction.type === 'sent' ? 'To:' : 'From:' } {themDisplay} <Icons ml="7px" name="ShareBox" size="15px" />
        </Text>
      </Flex>
      <Flex height="100%" alignItems="center">
        <Spinner size={1} color={colors.brand.primary} />
      </Flex>
    </Flex>
  );
};
