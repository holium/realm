import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import { Flex } from '@holium/design-system/general';
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
import { TransactionPasscode } from '../../components/Transaction/TransactionPasscode';
import { WalletCardStyle } from '../../components/WalletCardWrapper';
import {
  convertBtcAmountToUsd,
  convertERC20AmountToUsd,
  convertEthAmountToUsd,
  EthAmount,
  formatBtcAmount,
  formatCoinAmount,
  formatEthAmount,
  formatZigAmount,
} from '../../helpers';
import { TransactionRecipient, WalletScreen } from '../../types';

type Props = {
  wallet: BitcoinWalletType | EthWalletType;
  coin: ERC20Type | null;
  transactions: TransactionType[];
  coins: ERC20Type[] | null;
  nfts: ERC721Type[] | null;
  network: NetworkType;
  protocol: ProtocolType;
  currentWallet?: EthWalletType | BitcoinWalletType;
  ethereum: EthStoreType;
  bitcoin: BitcoinStoreType;
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
  sendEthereumTransaction: (...args: any) => Promise<any>;
};

export const DetailScreenBody = ({
  wallet,
  coin,
  transactions,
  coins,
  nfts,
  network,
  protocol,
  currentWallet,
  bitcoin,
  ethereum,
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
  sendERC20Transaction,
  sendEthereumTransaction,
}: Props) => {
  const qrCode = useToggle(false);

  // TODO default to coins or nfts if they have those
  const [tab, setTab] = useState<WalletTab>('transactions');
  const [showPasscode, setShowPasscode] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [transactionRecipient, setTransactionRecipient] =
    useState<TransactionRecipient | null>(null);

  const isSendingTransaction = [
    WalletScreen.TRANSACTION_SEND,
    WalletScreen.TRANSACTION_CONFIRM,
  ].includes(screen);
  const hideWalletHero = screen === WalletScreen.TRANSACTION_CONFIRM;

  const sendTransaction = async (passcode: number[]) => {
    try {
      if (network === NetworkType.ETHEREUM) {
        if (protocol === ProtocolType.UQBAR) {
          // await submitUqbarTransaction(
          //   currentWallet?.index.toString() ?? '',
          //   passcode
          // );
        } else {
          if (!transactionRecipient) return;

          if (coin) {
            await sendERC20Transaction(
              currentWallet?.index.toString() ?? '',
              transactionRecipient.address ??
                transactionRecipient.patpAddress ??
                '',
              transactionAmount.toString(),
              coin.address,
              passcode,
              transactionRecipient.patp
            );
          } else {
            await sendEthereumTransaction(
              currentWallet?.index.toString() ?? '',
              transactionRecipient.address ||
                transactionRecipient.patpAddress ||
                '',
              transactionAmount.toString(),
              passcode,
              transactionRecipient.patp
            );
          }
        }
      }

      close();
    } catch (e) {
      console.error(e);
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

  let amountUsdDisplay = '$0.00 USD';
  if (network === NetworkType.ETHEREUM) {
    if (coin && coin.conversions.usd) {
      amountUsdDisplay = `$${convertERC20AmountToUsd(
        formatCoinAmount(coin.balance, coin.decimals),
        coin.conversions.usd
      )} USD`;
    } else if (ethereum.conversions.usd) {
      amountUsdDisplay = `$${convertEthAmountToUsd(
        formatEthAmount(
          (wallet as EthWalletType).data.get(protocol)?.balance ?? ''
        ),
        ethereum.conversions.usd
      )} USD`;
    }
  } else if (bitcoin.conversions.usd) {
    amountUsdDisplay = `$${convertBtcAmountToUsd(
      formatBtcAmount((wallet as BitcoinWalletType).balance),
      bitcoin.conversions.usd
    )} USD`;
  }

  if (showPasscode) {
    return (
      <TransactionPasscode
        checkPasscode={checkPasscode}
        onSuccess={(code: number[]) => sendTransaction(code)}
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

      {!hideWalletHero && (
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
          />
        </Flex>
      )}
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
          ethToUsd={ethToUsd}
          ethAmount={ethAmount}
          navigate={navigate}
        />
      )}
      {tab === 'coins' && coins && (
        <CoinList coins={coins as any} navigate={navigate} />
      )}
      {tab === 'nfts' && nfts && (
        <NFTList nfts={nfts as any} navigate={navigate} />
      )}
      {isSendingTransaction && (
        <SendTransaction
          wallet={wallet}
          coin={coin}
          network={network}
          protocol={protocol}
          uqTx={uqTx}
          screen={screen}
          ethereum={ethereum}
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
