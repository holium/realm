import { useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { Flex, Box, Button, Text } from '@holium/design-system';
import { useShipStore } from 'renderer/stores/ship.store';
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
  ERC20Type,
  EthWalletType,
  NetworkType,
  WalletView,
} from 'os/services/tray/wallet-lib/wallet.model';
import { CoinList } from './CoinList';
import { NFTList } from './NFTList';
import { WalletActions } from 'renderer/logic/actions/wallet';

type DisplayType = 'coins' | 'nfts' | 'transactions';

interface DetailProps {
  theme: ThemeModelType;
  hidePending: boolean;
}
const DetailPresenter = (props: DetailProps) => {
  const { walletStore } = useShipStore();
  const [QROpen, setQROpen] = useState(false);
  const sendTrans =
    walletStore.navState.view === WalletView.TRANSACTION_SEND ||
    walletStore.navState.view === WalletView.TRANSACTION_CONFIRM;
  const hideWalletHero =
    walletStore.navState.view === WalletView.TRANSACTION_CONFIRM;
  const [listView, setListView] = useState<DisplayType>('transactions'); // TODO default to coins or nfts if they have those

  const onScreenChange = () => {};
  const close = async () => {
    await walletStore.navigateBack();
  };

  const wallet = walletStore.currentWallet;
  let coins = null;
  let nfts = null;
  const hasCoin =
    walletStore.navState.detail && walletStore.navState.detail.type === 'coin';
  let coin: ERC20Type | null = null;
  if (walletStore.navState.network === 'ethereum') {
    const ethWalletData = (wallet as EthWalletType).data.get(
      walletStore.navState.protocol
    );
    if (ethWalletData) {
      if (hasCoin && walletStore.navState.detail?.key) {
        const newCoin = ethWalletData.coins.get(
          walletStore.navState.detail?.key
        );
        if (newCoin) coin = newCoin;
      }
      coins = getCoins(ethWalletData.coins);
      nfts = getNfts(ethWalletData.nfts);
    }
  }

  const walletTransactions =
    walletStore.navState.network === NetworkType.ETHEREUM
      ? coin
        ? (wallet as EthWalletType).data
            ?.get(walletStore.navState.protocol ?? '')
            ?.coins.get(coin.address)?.transactionList.transactions
        : (wallet as EthWalletType).data.get(walletStore.navState.protocol)
            ?.transactionList.transactions
      : (wallet as BitcoinWalletType).transactionList.transactions;

  let transactions = useMemo(
    () => getTransactions(walletTransactions || new Map()),
    [walletTransactions]
  );
  const pendingTransactions = transactions
    .filter((trans) => trans.status === 'pending')
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? 0).getTime() -
        new Date(a.completedAt ?? 0).getTime()
    );
  const transactionHistory = transactions
    .filter((trans) => trans.status !== 'pending')
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? 0).getTime() -
        new Date(a.completedAt ?? 0).getTime()
    );
  transactions = [...pendingTransactions, ...transactionHistory];

  if (!wallet) return null;

  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent="flex-start"
      flexDirection="column"
      py={1}
      // px={3}
      pb={0}
    >
      <DetailHero
        wallet={wallet}
        coin={coin}
        QROpen={QROpen}
        setQROpen={setQROpen}
        sendTrans={sendTrans}
        hideWalletHero={hideWalletHero}
        onScreenChange={onScreenChange}
        setSendTrans={(send: boolean) => {
          if (send) {
            WalletActions.navigate(WalletView.TRANSACTION_SEND, {
              walletIndex: `${wallet.index}`,
              protocol: walletStore.navState.protocol,
              ...(coin && {
                detail: {
                  type: 'coin',
                  txtype: 'coin',
                  coinKey: coin.address,
                  key: coin.address,
                },
              }),
            });
          } else {
            WalletActions.navigateBack();
          }
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
              <Text.Custom mb={2} opacity={0.5} fontWeight={500} fontSize={2}>
                Transactions
              </Text.Custom>
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
                network={walletStore.navState.network}
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
              {listView === 'coins' && coins && <CoinList coins={coins} />}
              {listView === 'nfts' && nfts && <NFTList nfts={nfts} />}
            </>
          )}
        </Flex>
      </Box>
    </Flex>
  );
};

export const Detail = observer(DetailPresenter);

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
      <Button.TextButton onClick={props.onClick}>
        {props.children}
      </Button.TextButton>
    ) : (
      <Button.TextButton
        onClick={props.onClick}
        textColor={baseTheme.colors.text.disabled}
        fontWeight={500}
      >
        {props.children}
      </Button.TextButton>
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
