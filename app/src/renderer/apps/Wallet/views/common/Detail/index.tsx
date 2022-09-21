import { FC, useState } from 'react';
import { isValidPatp } from 'urbit-ob';
import styled from 'styled-components';
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
import { TransactionType } from 'os/services/tray/wallet.model';

const FlexWithShadow = styled(Flex)`
  box-shadow: 0px 0px 9px rgba(0, 0, 0, 0.12);
`

interface EthDetailProps {
  theme: ThemeModelType;
  hidePending: boolean
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
  const transactions = getTransactions(walletApp.ethereum.transactions, wallet?.address)
    .sort((a, b) => ((new Date(b.initiatedAt)).getTime() - (new Date(a.initiatedAt)).getTime()));

  /* @ts-ignore */
  const themeData = getBaseTheme(theme.currentTheme);

  return (
    <Flex width="100%" height="100%" flexDirection="column" p={3}>
      {/* @ts-ignore */}
      <FlexWithShadow
        p={3}
        width="100%"
        flexDirection="column"
        background={lighten(0.02, theme.currentTheme.windowColor)}
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
      </FlexWithShadow>
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
          <TransactionList transactions={transactions} hidePending={props.hidePending} />
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
