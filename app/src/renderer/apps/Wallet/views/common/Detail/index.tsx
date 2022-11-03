import { FC, useEffect, useState } from 'react';
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
  getCoins,
  getNfts,
} from '../../../lib/helpers';

import { DetailHero } from './Hero';
import { TransactionList } from '../Transaction/List';
import { SendTransaction } from '../Transaction/Send';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { WalletView } from 'os/services/tray/wallet.model';

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

  const wallet = walletApp.network === 'ethereum'
      ? walletApp.ethereum.wallets.get(walletApp.currentIndex!)
      : walletApp.bitcoin.wallets.get(walletApp.currentIndex!);


  var coins
  var nfts
  let hasCoin = walletApp.currentItem && walletApp.currentItem.type === 'coin';
  let coin = null;
  if (walletApp.network === 'ethereum') {
    if (hasCoin) {
      coin = wallet!.coins.get(walletApp!.currentItem!.key)!;
    }
    coins = getCoins(wallet!.coins);
    nfts = getNfts(wallet!.nfts);
  }
  const networkTransactions = walletApp.network === 'ethereum'
      ? walletApp.ethereum.wallets.get(walletApp.currentIndex!)!.transactions
      : walletApp.bitcoin.wallets.get(walletApp.currentIndex!)!.transactions;
  const transactions = getTransactions(
    networkTransactions
    // wallet?.address,
    // coin
  ).sort(
    (a, b) =>
      new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime()
  );

  /*useEffect(() => {
    if (coins.length) {
      setListView('coins');
    }
  });*/

  /* @ts-ignore */
  const themeData = getBaseTheme(theme.currentTheme);

  return (
    <Flex width="100%" height="100%" flexDirection="column" px={3}>
      <DetailHero
        wallet={wallet!}
        coin={coin}
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
          {!coin ? (
            <>
              <ListSelector
                network={walletApp.network}
                selected={listView}
                onChange={(newView: DisplayType) => setListView(newView)}
              />
              {listView === 'transactions' && (
                <TransactionList
                  transactions={transactions}
                  hidePending={props.hidePending}
                />
              )}
              {listView === 'coins' && <CoinList coins={coins} />}
              {listView === 'nfts' && <NFTList nfts={nfts} />}
            </>
          ) : (
            <>
              <Box pb={1}>
                <Text variant="body" fontSize={2} color="text.tertiary">
                  Transactions
                </Text>
              </Box>
              <TransactionList
                transactions={transactions}
                hidePending={props.hidePending}
                ethType={coin?.address}
              />
            </>
          )}
        </Flex>
      </Box>
      <Flex
        position="absolute"
        top="582px"
        zIndex={999}
        onClick={() => WalletActions.navigateBack()}
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
  selected: DisplayType;
  onChange: any;
  network: string;
}
function ListSelector(props: ListSelectorProps) {
  const { theme } = useServices();
  const baseTheme = getBaseTheme(theme.currentTheme);

  let MenuButton = (props: any) => {
    return props.selected ? (
      <TextButton onClick={props.onClick}>{props.children}</TextButton>
    ) : (
      <TextButton
        onClick={props.onClick}
        textColor={baseTheme.colors.text.disabled}
        fontWeight={400}
      >
        {props.children}
      </TextButton>
    );
  };
  return (
    <Flex mb={2} alignItems="center">
      {props.network === 'ethereum' &&
        <MenuButton
          selected={props.selected === 'coins'}
          onClick={() => props.onChange('coins')}
        >
          Coins
        </MenuButton>
      }
      {props.network === 'ethereum' &&
        <MenuButton
          selected={props.selected === 'nfts'}
          onClick={() => props.onChange('nfts')}
        >
          NFTs
        </MenuButton>
      }
      <MenuButton
        selected={props.selected === 'transactions'}
        onClick={() => props.onChange('transactions')}
      >
        Transactions
      </MenuButton>
    </Flex>
  );
}
