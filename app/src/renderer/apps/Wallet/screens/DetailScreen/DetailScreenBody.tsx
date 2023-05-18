import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import {
  Box,
  CopyButton,
  Flex,
  Icon,
  Text,
} from '@holium/design-system/general';
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

import { Balance } from '../../components/Detail/Balance';
import { CoinList } from '../../components/Detail/CoinList';
import {
  DisplayType,
  ListSelector,
} from '../../components/Detail/ListSelector';
import { NFTList } from '../../components/Detail/NFTList';
import { SendReceiveButtons } from '../../components/Detail/SendReceiveButtons';
import { SendTransaction } from '../../components/Transaction/SendTransaction';
import { TransactionList } from '../../components/Transaction/TransactionList';
import { TransactionPasscode } from '../../components/Transaction/TransactionPasscode';
import {
  WalletCardStyle,
  walletCardStyleTransition,
} from '../../components/WalletCardWrapper';
import {
  convertBtcAmountToUsd,
  convertERC20AmountToUsd,
  convertEthAmountToUsd,
  EthAmount,
  formatBtcAmount,
  formatCoinAmount,
  formatEthAmount,
  formatZigAmount,
  shortened,
} from '../../helpers';
import { TransactionRecipient, WalletScreen } from '../../types';
import { AddressStyle, BreadCrumb } from './DetailScreenBody.syles';

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
  sendERC20Transaction,
}: Props) => {
  const qrCode = useToggle(false);

  const [showPasscode, setShowPasscode] = useState(false);

  const [listView, setListView] = useState<DisplayType>('transactions'); // TODO default to coins or nfts if they have those

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

  const amountUsdDisplay =
    network === 'ethereum'
      ? !coin
        ? ethereum.conversions.usd
          ? '$' +
            `${convertEthAmountToUsd(
              formatEthAmount(
                (wallet as EthWalletType).data.get(protocol)?.balance ?? ''
              ),
              ethereum.conversions.usd
            )}`
          : ''
        : coin.conversions.usd
        ? '$' +
          convertERC20AmountToUsd(
            formatCoinAmount(coin.balance, coin.decimals),
            coin.conversions.usd
          )
        : ''
      : bitcoin.conversions.usd
      ? '$' +
        `${convertBtcAmountToUsd(
          formatBtcAmount((wallet as BitcoinWalletType).balance),
          bitcoin.conversions.usd
        )}`
      : '';

  const accountDisplay = !coin ? (
    <Text.Body
      layoutId={`wallet-name-${wallet.address}`}
      layout="position"
      transition={walletCardStyleTransition}
      mt={2}
      fontWeight={600}
      style={{ textTransform: 'uppercase' }}
    >
      {wallet.nickname}
    </Text.Body>
  ) : (
    <Flex
      layout="position"
      alignItems="center"
      gap={8}
      transition={walletCardStyleTransition}
    >
      <Flex flexDirection="row" alignItems="center">
        <BreadCrumb
          fontWeight={500}
          fontSize={2}
          style={{ textTransform: 'uppercase' }}
          onClick={onClickNavigateBack}
        >
          {`${wallet.nickname}`}
        </BreadCrumb>
        <Text.Body pl="2px" fontWeight={500} fontSize={2}>{` / `}</Text.Body>
        <Text.Body
          fontSize={2}
          style={{
            marginLeft: '4px',
          }}
        >
          {coin.name}
        </Text.Body>
      </Flex>
    </Flex>
  );

  const [transactionAmount, setTransactionAmount] = useState(0);
  const [transactionRecipient, setTransactionRecipient] =
    useState<TransactionRecipient>({});

  const sendTransaction = async (passcode: number[]) => {
    try {
      if (network === NetworkType.ETHEREUM) {
        if (protocol === ProtocolType.UQBAR) {
          // await submitUqbarTransaction(
          //   currentWallet?.index.toString() ?? '',
          //   passcode
          // );
        } else {
          coin
            ? await sendERC20Transaction(
                currentWallet?.index.toString() ?? '',
                transactionRecipient.address ??
                  transactionRecipient.patpAddress ??
                  '',
                transactionAmount.toString(),
                coin.address,
                passcode,
                transactionRecipient.patp
              )
            : await sendEthereumTransaction(
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

      close();
    } catch (e) {
      console.error(e);
    }
  };

  if (showPasscode) {
    return (
      <TransactionPasscode
        checkPasscode={checkPasscode}
        onSuccess={(code: number[]) => {
          sendTransaction(code);
        }}
      />
    );
  }

  return (
    <WalletCardStyle
      width="100%"
      transition={walletCardStyleTransition}
      isSelected
    >
      <Flex
        style={{ height: qrCode.isOn ? 242 : 38 }}
        borderRadius="8px"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="center"
      >
        <AddressStyle>
          <Flex>
            {network === NetworkType.ETHEREUM ? (
              <Icon name="Ethereum" mr={2} />
            ) : (
              <Icon name="Bitcoin" mr={2} />
            )}
            <Text.Body pt="2px" textAlign="center" fontSize="14px">
              {shortened(wallet.address)}
            </Text.Body>
          </Flex>
          <Flex>
            {sendTrans ? (
              <Icon name="ChevronDown" />
            ) : (
              <Flex gap={10}>
                <CopyButton content={wallet.address} />
                <Box onClick={qrCode.toggle}>
                  <Icon name="QRCode" />
                </Box>
              </Flex>
            )}
          </Flex>
        </AddressStyle>
        <Box mt={2} width="100%" height={204} hidden={!qrCode.isOn}>
          <Flex
            width="100%"
            height="200px"
            justifyContent="center"
            alignItems="center"
          >
            <QRCodeSVG width="100%" height="100%" value={wallet.address} />
          </Flex>
        </Box>
      </Flex>
      <Box
        transition={walletCardStyleTransition}
        width="100%"
        hidden={hideWalletHero}
        gap={10}
      >
        {accountDisplay}
        <Balance
          address={wallet.address}
          coin={coin}
          amountDisplay={amountDisplay}
          amountUsdDisplay={amountUsdDisplay}
        />
      </Box>
      <SendReceiveButtons
        hidden={sendTrans}
        send={() =>
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
          })
        }
        receive={qrCode.toggleOn}
      />
      <ListSelector
        network={network}
        selected={listView}
        onChange={(newView: DisplayType) => setListView(newView)}
      />

      <Flex
        width="100%"
        flexDirection="column"
        justifyContent="center"
        gap={10}
      >
        {!coin && (
          <>
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
      <SendTransaction
        wallet={wallet}
        hidden={!sendTrans}
        close={close}
        coin={coin}
        network={network}
        protocol={protocol}
        uqTx={uqTx}
        screen={screen}
        ethereum={ethereum}
        navigate={navigate}
        onConfirm={() => setShowPasscode(true)}
        setTransactionAmount={setTransactionAmount}
        transactionAmount={transactionAmount}
        setTransactionRecipient={setTransactionRecipient}
        transactionRecipient={transactionRecipient}
        to={to}
        getRecipient={getRecipient}
      />
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
    </WalletCardStyle>
  );
};
