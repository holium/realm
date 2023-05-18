import { useState } from 'react';

import { Box, Flex, Text } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import {
  NetworkType,
  ProtocolType,
  RecipientPayload,
} from 'os/services/ship/wallet/wallet.types';
import {
  BitcoinWalletType,
  ERC20Type,
  ERC721Type,
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
  onScreenChange: (screen: string) => void;
  setSendTrans: (sendTrans: boolean) => void;
  transactions: TransactionType[];
  coins: ERC20Type[] | null;
  nfts: ERC721Type[] | null;
  network: NetworkType;
  protocol: ProtocolType;
  currentWallet?: EthWalletType | BitcoinWalletType;
  bitcoin: any;
  ethereum: any;
  checkPasscode: (passcode: number[]) => Promise<boolean>;
  sendERC20Transaction: any;
  sendEthereumTransaction: any;
  onClickNavigateBack: () => void;
  close: () => void;
  ethToUsd: number;
  ethAmount?: EthAmount;
  ethType?: string;
  txType?: string;
  coinKey?: string;
  navigate: (view: WalletScreen, options?: WalletNavOptions) => void;
  uqTx?: UqTxType;
  screen: WalletScreen;
  to: string | undefined;
  getRecipient: (ship: string) => Promise<RecipientPayload>;
};

export const DetailScreenBody = ({
  wallet,
  coin,
  sendTrans,
  hideWalletHero,
  onScreenChange,
  close,
  setSendTrans,
  transactions,
  coins,
  nfts,
  network,
  protocol,
  currentWallet,
  bitcoin,
  ethereum,
  checkPasscode,
  sendERC20Transaction,
  sendEthereumTransaction,
  onClickNavigateBack,
  ethToUsd,
  ethAmount,
  ethType,
  txType,
  coinKey,
  navigate,
  uqTx,
  screen,
  to,
  getRecipient,
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
        checkPasscode={checkPasscode}
        sendERC20Transaction={sendERC20Transaction}
        sendEthereumTransaction={sendEthereumTransaction}
        onClickNavigateBack={onClickNavigateBack}
        coin={coin}
        QROpen={qrCode.isOn}
        setQROpen={qrCode.toggle}
        sendTrans={sendTrans}
        hideWalletHero={hideWalletHero}
        navigate={navigate}
        screen={screen}
        onScreenChange={onScreenChange}
        setSendTrans={setSendTrans}
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
          )
        }
        uqTx={uqTx}
        to={to}
        getRecipient={getRecipient}
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
