import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { theme as themes, ThemeType } from 'renderer/theme';
import { darken, lighten } from 'polished';

import { Flex, Box, Text, Icons } from 'renderer/components';
import { CircleButton } from '../../../components/CircleButton';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { TransactionType, WalletView } from 'os/services/tray/wallet.model';
import { shortened, formatWei, convertWeiToUsd, monthNames, getBaseTheme, getTransactions, EthAmount, formatEthAmount, formatBtcAmount, convertEthAmountToUsd, convertBtcAmountToUsd } from '../../../lib/helpers';

import { WalletInfo } from './WalletInfo';
import { TransactionList } from './TransactionList';
import { SendTransaction } from './SendTransaction';
import { WalletActions } from 'renderer/logic/actions/wallet';

interface EthDetailProps {
  theme: ThemeModelType
}

export const Detail: FC<EthDetailProps> = observer((props: EthDetailProps) => {
  const { walletApp } = useTrayApps();
  let wallet = walletApp.ethereum.wallets.get(walletApp.currentIndex!);
  let transactions = getTransactions(walletApp.ethereum.transactions, wallet!.address);

  const { desktop } = useServices();
  let theme = getBaseTheme(desktop);
  let panelBackground = darken(0.04, props.theme!.windowColor);
  let panelBorder = darken(0.08, props.theme!.windowColor);

  const [ QROpen, setQROpen ] = useState(false);
  const [ sendTrans, setSendTrans ] = useState(false)
  const [ hideWalletHero, setHideWalletHero] = useState(false);
  console.log('transactions:', transactions)

  const onScreenChange = (newScreen: string) => setHideWalletHero(newScreen === 'confirm');
  const close = () => {
    setSendTrans(false);
    setHideWalletHero(false);
  }

  return (
    <Flex width="100%" height="100%" flexDirection="column" p={3}>
      { /* @ts-ignore */ }
      <Flex p={3} width="100%" flexDirection="column" background={lighten(.02, desktop.theme.windowColor)} boxShadow="0px 0px 9px rgba(0, 0, 0, 0.12)" borderRadius="16px">
        <WalletInfo wallet={wallet!} QROpen={QROpen} setQROpen={setQROpen} sendTrans={sendTrans} hideWalletHero={hideWalletHero} />
        <SendReceiveButtons hidden={sendTrans} theme={desktop.theme!} send={() => setSendTrans(true)} receive={() => setQROpen(true)} />
        <SendTransaction wallet={wallet!} hidden={!sendTrans} onScreenChange={onScreenChange} close={close} />
      </Flex>
      <Box width="100%" hidden={QROpen || sendTrans} pb={7}>
        <Flex width="100%" pt={6} flexDirection="column" justifyContent="center">
          <Box pb={2}>
            <Text variant="body" fontSize={2} color="text.tertiary">Transactions</Text>
          </Box>
          <TransactionList transactions={transactions} />
        </Flex>
      </Box>
      <Flex position="absolute" top="542px" zIndex={999} onClick={() => WalletActions.setView(WalletView.ETH_LIST)}>
        <Icons name="ArrowLeftLine" size={2} color={desktop.theme.iconColor} />
      </Flex>
    </Flex>
  );
});

function SendReceiveButtons (props: { hidden: boolean, theme: ThemeModelType, send: any, receive: any }) {
  let panelBackground = darken(0.04, props.theme.windowColor);

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
