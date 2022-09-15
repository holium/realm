import { FC, useState } from 'react';
import { isValidPatp} from 'urbit-ob';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { theme as themes, ThemeType } from 'renderer/theme';
import { darken, lighten } from 'polished';
import {QRCodeSVG} from 'qrcode.react';

import { Flex, Box, Icons, Text, Sigil, Button } from 'renderer/components';
import { CircleButton } from '../../../components/CircleButton';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { TransactionType } from 'os/services/tray/wallet.model';
import { shortened, formatWei, convertWeiToUsd, monthNames, getBaseTheme, EthAmount, formatEthAmount, formatBtcAmount, convertEthAmountToUsd, convertBtcAmountToUsd } from '../../../lib/helpers';

const NoScrollBar = styled(Flex)`
::-webkit-scrollbar {
    display: none;
}
`
interface InputProps { hoverBg: string }
const DarkenOnHover = styled(Flex)<InputProps>`
  &:hover {
    background-color: ${props => props.hoverBg};
    border-radius: 4px;
  }
`

interface TransactionProps {
  transaction: TransactionType
}
export const Transaction = observer((props: TransactionProps) => {
  const { desktop } = useServices();
  let hoverBackground = desktop.theme!.mode === 'light' ? darken(.04, desktop.theme!.windowColor) : darken(.04, desktop.theme!.windowColor);

  const { transaction } = props;
  let wasSent = transaction.type === 'sent';
  let isEth = transaction.network === 'ethereum';
  let themDisplay = transaction.theirPatp || shortened(transaction.theirAddress);
  let initiatedDate = new Date(transaction.initiatedAt);

  let ethAmount = formatEthAmount(isEth ? transaction.amount : '1')
  let btcAmount = formatBtcAmount(!isEth ? transaction.amount : '1')

  return (
    <DarkenOnHover p={2} width="100%" justifyContent="space-between" alignItems="center" hoverBg={hoverBackground}>
      <Flex flexDirection="column" justifyContent="center">
        <Text variant="h5" fontSize={3}>{ wasSent ? 'Sent' : 'Received'}</Text>
        <Flex>
          <Text variant="body" fontSize={1} color="text.success">
            {`${monthNames[initiatedDate.getMonth()]} ${initiatedDate.getDate()}`}
          </Text>
          <Text mx={1} variant="body" fontSize={1} color="text.disabled">·</Text>
          <Text variant="body" fontSize={1} color="text.disabled">
            { wasSent ? 'To:' : 'From:'} {themDisplay}
          </Text>
        </Flex>
      </Flex>
      <Flex flexDirection="column" justifyContent="center" alignItems="flex-end">
        <Text variant="body" fontSize={2}>
          {transaction.type === 'sent' ? '-' : ''} {isEth ? `${ethAmount.eth} ETH` : `${btcAmount.btc} BTC`}
        </Text>
        <Text variant="body" fontSize={1} color="text.disabled">
          {transaction.type === 'sent' ? '-' : ''}${isEth
            ? convertEthAmountToUsd(ethAmount)
            : convertBtcAmountToUsd(btcAmount)
          } USD
        </Text>
      </Flex>
    </DarkenOnHover>
  )
});

interface TransactionListProps {
  transactions: TransactionType[]
  theme: ThemeModelType
}
export const TransactionList = observer((props: TransactionListProps) => {
  const { desktop } = useServices();

  return (
    <>
      <NoScrollBar width="100%" height="180px" flexDirection="column" margin="auto" overflow="scroll">
        { props.transactions.length
          ? props.transactions.map((transaction, index) => <Transaction key={index} transaction={transaction} />)
          : <Text variant="h4">No transactions</Text>
        }
      </NoScrollBar>
      { props.transactions.length > 3 &&
        <Flex pt={1} width="100%" justifyContent="center">
          <Icons name="ChevronDown" size={1} color={desktop.theme.iconColor} />
        </Flex>
      }
    </>
  )
})
