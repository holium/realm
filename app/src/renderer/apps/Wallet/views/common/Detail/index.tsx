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

import { DetailHero } from './Hero';
import { TransactionList } from '../Transaction/List';
import { SendTransaction } from '../Transaction/Send';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { WalletView } from 'os/services/tray/wallet.model';

import { CoinList } from './CoinList';
import { NFTList } from './NFTList';

type DisplayType = 'coins' | 'nfts' | 'transactions';

const FlexWithShadow = styled(Flex)`
  box-shadow: 0px 0px 9px rgba(0, 0, 0, 0.12);
`;

interface DetailProps {
  theme: ThemeModelType;
  hidePending: boolean;
  displayMode?: DisplayType
}
export const Detail: FC<DetailProps> = observer((props: DetailProps) => {
  const { walletApp } = useTrayApps();
  const { theme } = useServices();
  const [QROpen, setQROpen] = useState(false);
  const [sendTrans, setSendTrans] = useState(false);
  const [hideWalletHero, setHideWalletHero] = useState(false);
  const [listView, setListView] = useState<DisplayType>('transactions'); // TODO default to coins or nfts if they have those

  const onScreenChange = (newScreen: string) =>
    setHideWalletHero(newScreen === 'confirm');
  const close = () => {
    setSendTrans(false);
    setHideWalletHero(false);
  };

  const wallet = walletApp.ethereum.wallets.get(walletApp.currentIndex!);
  const transactions = getTransactions(
    walletApp.ethereum.transactions,
    wallet?.address
  ).sort(
    (a, b) =>
      new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime()
  );

  /* @ts-ignore */
  const themeData = getBaseTheme(theme.currentTheme);

  return (
    <Flex width="100%" height="100%" flexDirection="column" px={3}>
      <DetailHero
        wallet={wallet!}
        coin="usdc"
        QROpen={QROpen}
        setQROpen={setQROpen}
        sendTrans={sendTrans}
        hideWalletHero={hideWalletHero}
        onScreenChange={(newScreen: string) => onScreenChange(newScreen)} // changed
        setSendTrans={(send: boolean) => setSendTrans(send)} // changed
        close={close}
      />
      <Box width="100%" hidden={QROpen || sendTrans}>
        <Flex
          width="100%"
          pt={6}
          flexDirection="column"
          justifyContent="center"
        >
          <ListSelector selected={listView} onChange={(newView: DisplayType) => setListView(newView)} />
         { listView === 'transactions' && <TransactionList transactions={transactions} hidePending={props.hidePending}/> }
         { listView === 'coins' && <CoinList /> }
         { listView === 'nfts' && <NFTList /> }
        </Flex>
      </Box>
      <Flex
        position="absolute"
        top="542px"
        zIndex={999}
        onClick={() => WalletActions.setView(WalletView.ETH_LIST)}
      >
        <Icons
          name="ArrowLeftLine"
          size={2}
          color={theme.currentTheme.iconColor}
        />
      </Flex>
    </Flex>
  );
});

interface ListSelectorProps {
  selected: DisplayType
  onChange: any
}
function ListSelector(props: ListSelectorProps) {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);

  let MenuButton = (props: any) => {
    return props.selected
      ? <TextButton onClick={props.onClick}>{props.children}</TextButton>
      : <TextButton onClick={props.onClick} textColor={baseTheme.colors.text.disabled} fontWeight={400}>{props.children}</TextButton>
  }
  return (
    <Flex mb={2} alignItems="center">
      <MenuButton selected={props.selected === 'coins'} onClick={() => props.onChange('coins')}>Coins</MenuButton>
      <MenuButton selected={props.selected === 'nfts'} onClick={() => props.onChange('nfts')}>NFTs</MenuButton>
      <MenuButton selected={props.selected === 'transactions'} onClick={() => props.onChange('transactions')}>Transactions</MenuButton>
    </Flex>
  )
}

function SendReceiveButtons(props: {
  hidden: boolean;
  desktopTheme: ThemeModelType;
  send: any;
  receive: any;
}) {
  let panelBackground = darken(0.04, props.desktopTheme.windowColor);

  return (
    <Box width="100%" hidden={props.hidden}>
      <Flex mt="18px" width="100%" justifyContent="center" alignItems="center">
        <Box mr="16px" onClick={props.receive}>
          <CircleButton
            icon="Receive"
            title="Receive"
            iconColor={panelBackground}
          />
        </Box>
        <Box onClick={props.send}>
          <CircleButton icon="Send" title="Send" iconColor={panelBackground} />
        </Box>
      </Flex>
    </Box>
  );
}
