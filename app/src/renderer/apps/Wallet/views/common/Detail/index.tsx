import { FC, useState } from 'react';
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
import { EthWalletType } from 'os/services/tray/wallet.model';

import { CoinList } from './CoinList';
import { NFTList } from './NFTList';

type DisplayType = 'coins' | 'nfts' | 'transactions';

interface DetailProps {
  theme: ThemeModelType;
  hidePending: boolean;
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

  const wallet = walletApp.currentWallet!;
  let coins = null;
  let nfts = null;
  const hasCoin =
    walletApp.navState.detail && walletApp.navState.detail.type === 'coin';
  let coin: any = null;
  if (walletApp.navState.network === 'ethereum') {
    if (hasCoin) {
      coin = (wallet as EthWalletType).coins.get(
        walletApp.navState.detail!.key
      )!;
    }
    coins = getCoins((wallet as EthWalletType).coins);
    nfts = getNfts((wallet as EthWalletType).nfts);
  }

  const walletTransactions =
    walletApp.navState.network === 'ethereum'
      ? wallet.transactions.get(walletApp.ethereum.network)
      : wallet.transactions;
  const transactions = getTransactions(walletTransactions || new Map()).sort(
    (a, b) =>
      new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
  );

  /* useEffect(() => {
    if (coins.length) {
      setListView('coins');
    }
  }); */

  const themeData = getBaseTheme(theme.currentTheme);

  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent="flex-start"
      flexDirection="column"
      p={4}
    >
      <DetailHero
        wallet={wallet}
        coin={coin}
        QROpen={QROpen}
        setQROpen={setQROpen}
        sendTrans={sendTrans}
        hideWalletHero={hideWalletHero}
        onScreenChange={(newScreen: string) => onScreenChange(newScreen)} // changed
        setSendTrans={(send: boolean) => setSendTrans(send)} // changed
        close={close}
        coinView={
          coin && (
            <Flex
              layout="position"
              transition={{
                layout: { duration: 0.1 },
                opacity: { ease: 'linear' },
              }}
              flexDirection="column"
              mt={6}
            >
              <Box pb={1}>
                <Text
                  color={themeData.colors.text.disabled}
                  fontWeight={500}
                  variant="body"
                >
                  Transactions
                </Text>
              </Box>
              <TransactionList
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
