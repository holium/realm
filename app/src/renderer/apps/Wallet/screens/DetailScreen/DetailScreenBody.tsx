import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import { Flex } from '@holium/design-system/general';
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
import { NFTList } from '../../components/Detail/NFTList';
import { SendReceiveButtons } from '../../components/Detail/SendReceiveButtons';
import { WalletAddressHeader } from '../../components/Detail/WalletAddressHeader';
import { WalletBalance } from '../../components/Detail/WalletBalance';
import { WalletBreadCrumbs } from '../../components/Detail/WalletBreadCrumbs';
import {
  WalletTab,
  WalletTabMenu,
} from '../../components/Detail/WalletTabMenu';
import { SendTransaction } from '../../components/Transaction/SendTransaction';
import { TransactionList } from '../../components/Transaction/TransactionList';
import { WalletCardStyle } from '../../components/WalletCardWrapper';
import {
  convertBtcAmountToUsd,
  convertERC20AmountToUsd,
  convertEthAmountToUsd,
  formatBtcAmount,
  formatCoinAmount,
  formatEthAmount,
  formatZigAmount,
} from '../../helpers';
import {
  SendERC20Transaction,
  SendEthereumTransaction,
  TransactionRecipient,
  WalletScreen,
} from '../../types';
import { SubmitTransactionPasscodeScreen } from './SubmitTransactionPasscodeScreen';

type Props = {
  wallet: BitcoinWalletType | EthWalletType;
  coin: ERC20Type | null;
  transactions: TransactionType[];
  coins: ERC20Type[] | null;
  nfts: ERC721Type[] | null;
  network: NetworkType;
  protocol: ProtocolType;
  ethPrice: number | undefined;
  bitcoinPrice: number | undefined;
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
  sendERC20Transaction: SendERC20Transaction;
  sendEthereumTransaction: SendEthereumTransaction;
};

export const DetailScreenBody = ({
  wallet,
  coin,
  transactions,
  coins,
  nfts,
  network,
  protocol,
  ethPrice,
  bitcoinPrice,
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
  sendERC20Transaction,
  sendEthereumTransaction,
}: Props) => {
  const qrCode = useToggle(false);

  const [coinPrice, setCoinPrice] = useState<number>();

  useEffect(() => {
    coin?.conversions.getUsdPrice(coin.name).then(setCoinPrice);
  }, [coin]);

  // TODO default to coins or nfts if they have those
  const [tab, setTab] = useState<WalletTab>('coins');
  const [showPasscode, setShowPasscode] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [transactionRecipient, setTransactionRecipient] =
    useState<TransactionRecipient | null>(null);

  const isSendingTransaction = [
    WalletScreen.TRANSACTION_SEND,
    WalletScreen.TRANSACTION_CONFIRM,
  ].includes(screen);

  const sendTransaction = async (passcode: number[]) => {
    try {
      if (network === NetworkType.ETHEREUM) {
        if (protocol === ProtocolType.UQBAR) {
          // await submitUqbarTransaction(
          //   wallet?.index.toString() ?? '',
          //   passcode
          // );
        } else {
          if (!transactionRecipient) return;

          if (coin) {
            await sendERC20Transaction({
              walletIndex: wallet.index.toString(),
              currentProtocol: protocol,
              path: wallet.index.toString() ?? '',
              toPatp: transactionRecipient.patp ?? '',
              passcode,
              from: wallet.address,
              to:
                transactionRecipient.address ??
                transactionRecipient.patpAddress ??
                '',
              amount: transactionAmount.toString(),
              contractAddress: coin.address,
              decimals: coin.decimals,
            });
          } else {
            await sendEthereumTransaction({
              walletIndex: wallet.index.toString(),
              to:
                transactionRecipient.address ??
                transactionRecipient.patpAddress ??
                '',
              amount: transactionAmount.toString(),
              passcode,
              toPatp: transactionRecipient.patp,
            });
          }
        }
      }

      close();
    } catch (e) {
      console.error('sendTransaction error', e);
    }
  };

  const amountDisplay =
    network === NetworkType.ETHEREUM
      ? !coin
        ? protocol === ProtocolType.UQBAR
          ? `${formatZigAmount(
              (wallet as EthWalletType).data.get(protocol)?.balance ?? ''
            )} zigs`
          : `${
              formatEthAmount(
                (wallet as EthWalletType).data.get(protocol)?.balance ?? ''
              ).eth
            } ETH`
        : `${formatCoinAmount(coin.balance, coin.decimals).display} ${
            coin.name
          }`
      : `${formatBtcAmount((wallet as BitcoinWalletType).balance).btc} BTC`;

  let amountUsdDisplay = '$ ... USD';
  if (network === NetworkType.ETHEREUM) {
    if (coin && coinPrice) {
      amountUsdDisplay = `$${convertERC20AmountToUsd(
        formatCoinAmount(coin.balance, coin.decimals),
        coinPrice
      )} USD`;
    } else if (ethPrice) {
      amountUsdDisplay = `$${convertEthAmountToUsd(
        formatEthAmount(
          (wallet as EthWalletType).data.get(protocol)?.balance ?? ''
        ),
        ethPrice
      )} USD`;
    }
  } else if (bitcoinPrice) {
    amountUsdDisplay = `$${convertBtcAmountToUsd(
      formatBtcAmount((wallet as BitcoinWalletType).balance),
      bitcoinPrice
    )} USD`;
  }

  if (showPasscode) {
    return (
      <SubmitTransactionPasscodeScreen
        checkPasscode={checkPasscode}
        onSuccess={sendTransaction}
      />
    );
  }

  return (
    <WalletCardStyle width="100%" isSelected>
      <WalletAddressHeader
        address={wallet.address}
        isSendingTransaction={isSendingTransaction}
        network={network}
        onClickQrCode={qrCode.toggle}
      />

      <Flex width="100%" flexDirection="column" gap="12px">
        <WalletBreadCrumbs
          walletNickname={wallet.nickname}
          coinName={coin?.name}
          onClickBack={onClickNavigateBack}
        />
        {qrCode.isOn && (
          <Flex width="100%" height="190px" minHeight={0} alignItems="center">
            <QRCodeSVG width="100%" height="100%" value={wallet.address} />
          </Flex>
        )}
        <WalletBalance
          coin={coin}
          amountDisplay={amountDisplay}
          amountUsdDisplay={amountUsdDisplay}
          simple={isSendingTransaction}
        />
      </Flex>
      {!isSendingTransaction && (
        <SendReceiveButtons
          send={() => {
            navigate(WalletScreen.TRANSACTION_SEND, {
              walletIndex: `${wallet.index}`,
              protocol: protocol,
              ...(coin && {
                detail: {
                  type: 'coin',
                  txtype: 'coin',
                  coinKey: coin.address,
                  key: coin.address,
                },
              }),
            });
          }}
          receive={qrCode.toggle}
        />
      )}
      {!isSendingTransaction && (
        <>
          <WalletTabMenu
            network={network}
            selected={tab}
            onSelect={(newTab) => setTab(newTab)}
          />
          {tab === 'transactions' && (
            <TransactionList
              transactions={transactions}
              txType={txType}
              coinKey={coinKey}
              ethType={ethType}
              ethPrice={ethPrice}
              bitcoinPrice={bitcoinPrice}
              navigate={navigate}
            />
          )}
          {tab === 'coins' && coins && (
            <CoinList coins={coins as any} navigate={navigate} />
          )}
          {tab === 'nfts' && nfts && (
            <NFTList nfts={nfts as any} navigate={navigate} />
          )}
        </>
      )}
      {isSendingTransaction && (
        <SendTransaction
          wallet={wallet}
          coin={coin}
          network={network}
          protocol={protocol}
          uqTx={uqTx}
          screen={screen}
          ethPrice={ethPrice}
          to={to}
          transactionRecipient={transactionRecipient}
          navigate={navigate}
          onConfirm={() => setShowPasscode(true)}
          setTransactionAmount={setTransactionAmount}
          transactionAmount={transactionAmount}
          setTransactionRecipient={setTransactionRecipient}
          getRecipient={getRecipient}
          close={close}
        />
      )}
    </WalletCardStyle>
  );
};
