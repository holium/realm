import { useState } from 'react';

import { Box, Flex, Text } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import {
  NetworkType,
  ProtocolType,
  RecipientPayload,
} from 'os/services/ship/wallet/wallet.types';
import {
  BitcoinStoreType,
  BitcoinWalletType,
  ERC20Type,
  ERC721Type,
  EthStoreType,
  EthWalletType,
  TransactionType,
  UqTxType,
  WalletNavOptions,
} from 'renderer/stores/models/wallet.model';

import { CoinList } from '../../components/Detail/CoinList';
import { DetailHero } from '../../components/Detail/DetailHero';
import {
  DisplayType,
  ListSelector,
} from '../../components/Detail/ListSelector';
import { NFTList } from '../../components/Detail/NFTList';
import { TransactionList } from '../../components/Transaction/TransactionList';
import { EthAmount } from '../../helpers';
import { WalletScreen } from '../../types';

type Props = {
  wallet: BitcoinWalletType | EthWalletType;
  coin: ERC20Type | null;
  sendTrans: boolean;
  hideWalletHero: boolean;
  transactions: TransactionType[];
  coins: ERC20Type[] | null;
  nfts: ERC721Type[] | null;
  network: NetworkType;
  protocol: ProtocolType;
  currentWallet?: EthWalletType | BitcoinWalletType;
  ethereum: EthStoreType;
  bitcoin: BitcoinStoreType;
  sendEthereumTransaction: any;
  ethToUsd: number | undefined;
  ethAmount?: EthAmount;
  ethType?: string;
  txType?: string;
  coinKey?: string;
  uqTx?: UqTxType;
  screen: WalletScreen;
  to: string | undefined;
  close: () => void;
  getRecipient: (ship: string) => Promise<RecipientPayload>;
  checkPasscode: (passcode: number[]) => Promise<boolean>;
  onClickNavigateBack: () => void;
  navigate: (view: WalletScreen, options?: WalletNavOptions) => void;
  sendERC20Transaction: (...args: any) => Promise<any>;
};

export const DetailScreenBody = ({
  wallet,
  coin,
  sendTrans,
  hideWalletHero,
  transactions,
  coins,
  nfts,
  network,
  protocol,
  currentWallet,
  bitcoin,
  ethereum,
  sendERC20Transaction,
  sendEthereumTransaction,
  ethToUsd,
  ethAmount,
  ethType,
  txType,
  coinKey,
  uqTx,
  screen,
  to,
  checkPasscode,
  navigate,
  getRecipient,
  onClickNavigateBack,
  close,
}: Props) => {
  const qrCode = useToggle(false);

  const [listView, setListView] = useState<DisplayType>('transactions'); // TODO default to coins or nfts if they have those

  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent="flex-start"
      flexDirection="column"
      gap={10}
    >
      <DetailHero
        wallet={wallet}
        currentWallet={currentWallet}
        network={network}
        protocol={protocol}
        bitcoin={bitcoin}
        ethereum={ethereum}
        sendERC20Transaction={sendERC20Transaction}
        sendEthereumTransaction={sendEthereumTransaction}
        coin={coin}
        QROpen={qrCode.isOn}
        setQROpen={qrCode.toggle}
        sendTrans={sendTrans}
        hideWalletHero={hideWalletHero}
        screen={screen}
        navigate={navigate}
        close={close}
        coinView={
          coin && !sendTrans ? (
            <Flex
              layout="position"
              transition={{
                layout: { duration: 0.1 },
                opacity: { ease: 'linear' },
              }}
              flexDirection="column"
            >
              <Text.Custom opacity={0.5} fontWeight={500} fontSize={2}>
                Transactions
              </Text.Custom>
              <TransactionList
                height={200}
                transactions={transactions}
                txType={txType}
                coinKey={coinKey}
                ethType={ethType}
                ethToUsd={ethToUsd}
                ethAmount={ethAmount}
                navigate={navigate}
              />
            </Flex>
          ) : null
        }
        uqTx={uqTx}
        to={to}
        getRecipient={getRecipient}
        onClickNavigateBack={onClickNavigateBack}
        checkPasscode={checkPasscode}
      />
      <Box width="100%" hidden={qrCode.isOn || sendTrans}>
        <Flex
          width="100%"
          flexDirection="column"
          justifyContent="center"
          gap={10}
        >
          {!coin && (
            <>
              <ListSelector
                network={network}
                selected={listView}
                onChange={(newView: DisplayType) => setListView(newView)}
              />
              {listView === 'transactions' && (
                <TransactionList
                  height={250}
                  transactions={transactions}
                  txType={txType}
                  coinKey={coinKey}
                  ethType={ethType}
                  ethToUsd={ethToUsd}
                  ethAmount={ethAmount}
                  navigate={navigate}
                />
              )}
              {listView === 'coins' && coins && (
                <CoinList coins={coins as any} navigate={navigate} />
              )}
              {listView === 'nfts' && nfts && (
                <NFTList nfts={nfts as any} navigate={navigate} />
              )}
            </>
          )}
        </Flex>
      </Box>
    </Flex>
  );
};
