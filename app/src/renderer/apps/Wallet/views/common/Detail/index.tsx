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
import { SendTransaction } from './SendTransaction';

interface EthDetailProps {
  theme: ThemeModelType
}

interface Transaction {
  type: string,
  amount: string,
  date: Date
  address: string
}

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

const transactions = [
  {
    type: 'sent',
    address: '0xB017058f7De4efF370AC8bF0c84906BEC3d0b2CE',
    amount: '320057483850000000',
    date: new Date('8/10/2022')
  },
  {
    type: 'received',
    address: '0xD299058f7De4efF370AC8bF0c84906BEC3d0b2CE',
    amount: '148392948570000000',
    date: new Date('8/2/2022')
  },
  {
    type: 'received',
    address: '0xC122058f7De4efF370AC8bF0c84906BEC3d0b2CE',
    amount: '923424554340000000',
    date: new Date('7/11/2022')
  },
]

export const Detail: FC<EthDetailProps> = observer((props: EthDetailProps) => {
  const { walletApp } = useTrayApps();
  const { desktop } = useServices();
  const [ QROpen, setQROpen ] = useState(false);
  const [ sendTrans, setSendTrans ] = useState(false)
  const [ hideWalletHero, setHideWalletHero] = useState(false);

  const onScreenChange = (newScreen: string) => setHideWalletHero(newScreen === 'confirm');
  const close = () => {
    setSendTrans(false);
    setHideWalletHero(false);
  }

  const wallet = walletApp.ethereum.wallets.get(walletApp.currentIndex!);

  /* @ts-ignore */
  const theme = getBaseTheme(desktop);
  const panelBackground = darken(0.04, props.theme!.windowColor);
  const panelBorder = darken(0.08, props.theme!.windowColor);

  const SendReceiveButtons: FC = () => (
    <Box width="100%" hidden={sendTrans}>
      <Flex mt="18px" width="100%" justifyContent="center" alignItems="center">
        <Box mr="16px" onClick={() => setQROpen(true)}>
          <CircleButton icon="Receive" title="Receive" iconColor={panelBackground} />
        </Box>
        <Box onClick={() => setSendTrans(true)}>
          <CircleButton icon="Send" title="Send" iconColor={panelBackground} />
        </Box>
      </Flex>
    </Box>
  );

  interface TransactionProps {
    transaction: Transaction
  }
  const Transaction: FC<TransactionProps> = (props: TransactionProps) => {
    const { transaction } = props;

    return (
      <Flex pt={2} width="100%" justifyContent="space-between" alignItems="center">
        <Flex flexDirection="column" justifyContent="center">
          <Text variant="h5" fontSize={3}>{transaction.type === 'received' ? 'Received ETH' : 'Sent ETH' }</Text>
          <Flex>
            <Text variant="body" fontSize={1} color="text.success">
              {`${monthNames[transaction.date.getMonth()]} ${transaction.date.getDate()}`}
            </Text>
            <Text mx={1} variant="body" fontSize={1} color="text.disabled">·</Text>
            <Text variant="body" fontSize={1} color="text.disabled">To: {shortened(transaction.address)}</Text>
          </Flex>
        </Flex>
        <Flex flexDirection="column" justifyContent="center" alignItems="flex-end">
          <Text variant="body" fontSize={2}>{transaction.type === 'sent' ? '-' : ''} {formatWei(transaction.amount)} ETH</Text>
          <Text variant="body" fontSize={1} color="text.disabled">
            {transaction.type === 'sent' ? '-' : ''}${convertWeiToUsd(transaction.amount)} USD
          </Text>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex width="100%" height="100%" flexDirection="column" p={3}>
      { /* @ts-ignore */ }
      <Flex p={3} width="100%" flexDirection="column" background={lighten(.02, desktop.theme.windowColor)} boxShadow="0px 0px 9px rgba(0, 0, 0, 0.12)" borderRadius="16px">
        <WalletInfo wallet={wallet!} QROpen={QROpen} setQROpen={setQROpen} sendTrans={sendTrans} hideWalletHero={hideWalletHero} />
        <SendReceiveButtons />
        <SendTransaction wallet={wallet!} hidden={!sendTrans} onScreenChange={onScreenChange} close={close} />
      </Flex>
      <Box width="100%" hidden={QROpen || sendTrans}>
        <Flex width="100%" pt={6} flexDirection="column" justifyContent="center">
          <Box pb={1}>
            <Text variant="body" fontSize={2} color="text.tertiary">Transactions</Text>
          </Box>
          { transactions.map((transaction, index) => <Transaction key={index} transaction={transaction} />) }
        </Flex>
      </Box>
    </Flex>
  );
});
