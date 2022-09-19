import { FC, useState } from 'react';
import { isValidPatp } from 'urbit-ob';
import { ethers } from 'ethers';
import { observer } from 'mobx-react';
import { theme as themes, ThemeType } from 'renderer/theme';
import { darken, lighten } from 'polished';
import { QRCodeSVG } from 'qrcode.react';

import { Flex, Box, Text, Icons } from 'renderer/components';
import { CircleButton } from '../../../components/CircleButton';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { ThemeModelType } from 'os/services/theme.model';
import {
  shortened,
  formatWei,
  convertWeiToUsd,
  monthNames,
  getBaseTheme,
  getTransactions,
} from '../../../lib/helpers';

import { WalletInfo } from './WalletInfo';
import { TransactionList } from './TransactionList';
import { SendTransaction } from './SendTransaction';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { WalletViews } from 'renderer/apps/Wallet';

interface EthDetailProps {
  theme: ThemeModelType;
}

interface Transaction {
  type: string;
  amount: string;
  date: Date;
  address: string;
}

export const Detail: FC<EthDetailProps> = observer((props: EthDetailProps) => {
  const { walletApp } = useTrayApps();
  const { theme } = useServices();
  const [QROpen, setQROpen] = useState(false);
  const [sendTrans, setSendTrans] = useState(false);
  const [hideWalletHero, setHideWalletHero] = useState(false);

  const onScreenChange = (newScreen: string) =>
    setHideWalletHero(newScreen === 'confirm');
  const close = () => {
    setSendTrans(false);
    setHideWalletHero(false);
  };

  const wallet = walletApp.ethereum.wallets.get(walletApp.currentIndex!);
  const transactions = getTransactions(walletApp.ethereum.transactions, wallet?.address);

  /* @ts-ignore */
  const themeData = getBaseTheme(theme.currentTheme);
  const panelBackground = darken(0.04, theme.currentTheme.windowColor);
  const panelBorder = darken(0.08, theme.currentTheme.windowColor);

  interface TransactionProps {
    transaction: Transaction;
  }
  const Transaction: FC<TransactionProps> = (props: TransactionProps) => {
    const { transaction } = props;

    return (
      <Flex
        pt={2}
        width="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Flex flexDirection="column" justifyContent="center">
          <Text variant="h5" fontSize={3}>
            {transaction.type === 'received' ? 'Received ETH' : 'Sent ETH'}
          </Text>
          <Flex>
            <Text variant="body" fontSize={1} color="text.success">
              {`${
                monthNames[transaction.date.getMonth()]
              } ${transaction.date.getDate()}`}
            </Text>
            <Text mx={1} variant="body" fontSize={1} color="text.disabled">
              ·
            </Text>
            <Text variant="body" fontSize={1} color="text.disabled">
              To: {shortened(transaction.address)}
            </Text>
          </Flex>
        </Flex>
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-end"
        >
          <Text variant="body" fontSize={2}>
            {transaction.type === 'sent' ? '-' : ''}{' '}
            {formatWei(transaction.amount)} ETH
          </Text>
          <Text variant="body" fontSize={1} color="text.disabled">
            {transaction.type === 'sent' ? '-' : ''}$
            {convertWeiToUsd(transaction.amount)} USD
          </Text>
        </Flex>
      </Flex>
    );
  };

  return (
    <Flex width="100%" height="100%" flexDirection="column" p={3}>
      {/* @ts-ignore */}
      <Flex
        p={3}
        width="100%"
        flexDirection="column"
        background={lighten(0.02, theme.currentTheme.windowColor)}
        // boxShadow="0px 0px 9px rgba(0, 0, 0, 0.12)"
        borderRadius="16px"
      >
        <WalletInfo
          wallet={wallet!}
          QROpen={QROpen}
          setQROpen={setQROpen}
          sendTrans={sendTrans}
          hideWalletHero={hideWalletHero}
        />
        {/* @ts-ignore */}
        <SendReceiveButtons hidden={sendTrans} desktopTheme={theme.currentTheme} send={() => setSendTrans(true)} receive={() => setQROpen(true)} />
        <SendTransaction
          wallet={wallet!}
          hidden={!sendTrans}
          onScreenChange={onScreenChange}
          close={close}
        />
      </Flex>
      <Box width="100%" hidden={QROpen || sendTrans}>
        <Flex
          width="100%"
          pt={6}
          flexDirection="column"
          justifyContent="center"
        >
          <Box pb={1}>
            <Text variant="body" fontSize={2} color="text.tertiary">
              Transactions
            </Text>
          </Box>
          <TransactionList transactions={transactions} />
        </Flex>
      </Box>
      <Flex position="absolute" top="542px" zIndex={999} onClick={() => WalletActions.setView(WalletViews.ETH_LIST)}>
        <Icons name="ArrowLeftLine" size={2} color={theme.currentTheme.iconColor} />
      </Flex>
    </Flex>
  );
});

function SendReceiveButtons (props: { hidden: boolean, desktopTheme: ThemeModelType, send: any, receive: any }) {
  let panelBackground = darken(0.04, props.desktopTheme.windowColor);

  return (
    <Box width="100%" hidden={props.hidden}>
      <Flex mt="18px" width="100%" justifyContent="center" alignItems="center">
        <Box mr="16px" onClick={props.receive}>
          <CircleButton icon="Receive" title="Receive" iconColor={panelBackground} />
        </Box>
        <Box onClick={props.send}>
          <CircleButton icon="Send" title="Send" iconColor={panelBackground} />
        </Box>
      </Flex>
    </Box>
  );
}
