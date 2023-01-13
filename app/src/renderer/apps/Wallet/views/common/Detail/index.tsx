import { FC, useMemo, useState } from 'react';
import { observer } from 'mobx-react';

import { Flex, Box, Text, TextButton } from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { ThemeModelType } from 'os/services/theme.model';
import {
  getBaseTheme,
  getTransactions,
  getCoins,
  getNfts,
} from '../../../lib/helpers';

import { DetailHero } from './Hero';
import { TransactionList } from '../Transaction/List';
import {
  BitcoinWalletType,
  EthWalletType,
  NetworkType,
  WalletView,
} from 'os/services/tray/wallet-lib/wallet.model';

import { CoinList } from './CoinList';
import { NFTList } from './NFTList';
import { rgba } from 'polished';
import { WalletActions } from 'renderer/logic/actions/wallet';

type DisplayType = 'coins' | 'nfts' | 'transactions';

interface DetailProps {
  theme: ThemeModelType;
  hidePending: boolean;
}
export const Detail: FC<DetailProps> = observer((props: DetailProps) => {
  const { walletApp } = useTrayApps();
  const { theme } = useServices();
  const [QROpen, setQROpen] = useState(false);
  // const [sendTrans, setSendTrans] = useState(false);
  const sendTrans = walletApp.navState.view === WalletView.TRANSACTION_SEND || walletApp.navState.view === WalletView.TRANSACTION_CONFIRM;
  // const [hideWalletHero, setHideWalletHero] = useState(false);
  const hideWalletHero = walletApp.navState.view === WalletView.TRANSACTION_CONFIRM;
  const [listView, setListView] = useState<DisplayType>('transactions'); // TODO default to coins or nfts if they have those

  const onScreenChange = (newScreen: string) => {}
//    setHideWalletHero(newScreen === 'confirm');
  const close = () => {
    // setSendTrans(false);
    WalletActions.navigateBack();
//    setHideWalletHero(false);
  };

  console.log('rendering WalletDetail');

  const wallet = walletApp.currentWallet!;
  let coins = null;
  let nfts = null;
  const hasCoin =
    walletApp.navState.detail && walletApp.navState.detail.type === 'coin';
  let coin: any = null;
  if (walletApp.navState.network === 'ethereum') {
    if (hasCoin) {
      coin = (wallet as EthWalletType).data
        .get(walletApp.navState.protocol)!
        .coins.get(walletApp.navState.detail!.key)!;
    }
    coins = useMemo(
      () =>
        getCoins(
          (wallet as EthWalletType).data.get(walletApp.navState.protocol)!.coins
        ),
      []
    );
    nfts = useMemo(
      () =>
        getNfts(
          (wallet as EthWalletType).data.get(walletApp.navState.protocol)!.nfts
        ),
      []
    );
  }

  const walletTransactions = useMemo(
    () =>
      walletApp.navState.network === NetworkType.ETHEREUM
        ? coin
          ? (wallet as EthWalletType).data
              .get(walletApp.navState.protocol)!
              .coins.get(coin.address)!.transactionList.transactions
          : (wallet as EthWalletType).data.get(walletApp.navState.protocol)!
              .transactionList.transactions
        : (wallet as BitcoinWalletType).transactionList.transactions,
    []
  );

  let transactions = useMemo(
    () => getTransactions(walletTransactions || new Map()),
    [walletTransactions]
  );
  const pendingTransactions = transactions
    .filter((trans) => trans.status === 'pending')
    .sort(
      (a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    );
  const transactionHistory = transactions
    .filter((trans) => trans.status !== 'pending')
    .sort(
      (a, b) =>
        new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
    );
  transactions = [...pendingTransactions, ...transactionHistory];

  const { textColor } = theme.currentTheme;
  const fadedTextColor = useMemo(() => rgba(textColor, 0.7), [textColor]);

  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent="flex-start"
      flexDirection="column"
      py={1}
      px={3}
      pb={0}
    >
      <DetailHero
        wallet={wallet}
        coin={coin}
        QROpen={QROpen}
        setQROpen={setQROpen}
        sendTrans={sendTrans}
        hideWalletHero={hideWalletHero}
        onScreenChange={(newScreen: string) => onScreenChange(newScreen)} // changed
        setSendTrans={(send: boolean) => {
          console.log('setting it')
          if (send) {
            WalletActions.navigate(WalletView.TRANSACTION_SEND, {
              walletIndex: '0',
            });
          }
          else {
            WalletActions.navigateBack();
          }
          // setSendTrans(send)} // changed
        }}
        close={close}
        coinView={
          coin &&
          !sendTrans && (
            <Flex
              layout="position"
              transition={{
                layout: { duration: 0.1 },
                opacity: { ease: 'linear' },
              }}
              flexDirection="column"
              mt={6}
            >
              <Box>
                <Text
                  mb={1}
                  color={fadedTextColor}
                  fontWeight={500}
                  variant="body"
                >
                  Transactions
                </Text>
              </Box>
              <TransactionList
                height={200}
                transactions={transactions}
                hidePending={props.hidePending}
                ethType={coin?.address}
              />
            </Flex>
          )
        }
      />
      <Box width="100%" hidden={QROpen || sendTrans}>
        <Flex
          width="100%"
          pt={4}
          flexDirection="column"
          justifyContent="center"
        >
          {!coin && (
            <>
              <ListSelector
                network={walletApp.navState.network}
                selected={listView}
                onChange={(newView: DisplayType) => setListView(newView)}
              />
              {listView === 'transactions' && (
                <TransactionList
                  height={230}
                  transactions={transactions}
                  hidePending={props.hidePending}
                />
              )}
              {listView === 'coins' && <CoinList coins={coins!} />}
              {listView === 'nfts' && <NFTList nfts={nfts!} />}
            </>
          )}
        </Flex>
      </Box>
    </Flex>
  );
});

interface ListSelectorProps {
  selected: DisplayType;
  onChange: any;
  network: string;
}
function ListSelector(props: ListSelectorProps) {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);

  const MenuButton = (props: any) => {
    return props.selected ? (
      <TextButton onClick={props.onClick}>{props.children}</TextButton>
    ) : (
      <TextButton
        onClick={props.onClick}
        textColor={baseTheme.colors.text.disabled}
        fontWeight={500}
      >
        {props.children}
      </TextButton>
    );
  };
  return (
    <Flex mb={2} alignItems="center">
      {props.network === 'ethereum' && (
        <MenuButton
          selected={props.selected === 'coins'}
          onClick={() => props.onChange('coins')}
        >
          Coins
        </MenuButton>
      )}
      {props.network === 'ethereum' && (
        <MenuButton
          selected={props.selected === 'nfts'}
          onClick={() => props.onChange('nfts')}
        >
          NFTs
        </MenuButton>
      )}
      <MenuButton
        selected={props.selected === 'transactions'}
        onClick={() => props.onChange('transactions')}
      >
        Transactions
      </MenuButton>
    </Flex>
  );
}
