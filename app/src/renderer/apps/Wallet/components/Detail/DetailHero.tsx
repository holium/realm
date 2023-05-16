import { useState } from 'react';
import { observer } from 'mobx-react';
import { QRCodeSVG } from 'qrcode.react';
import styled from 'styled-components';

import {
  Box,
  CopyButton,
  Flex,
  Icon,
  Text,
} from '@holium/design-system/general';

import {
  NetworkType,
  ProtocolType,
} from 'os/services/ship/wallet/wallet.types';
import {
  BitcoinWalletType,
  ERC20Type,
  EthWalletType,
} from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import {
  convertBtcAmountToUsd,
  convertERC20AmountToUsd,
  convertEthAmountToUsd,
  formatBtcAmount,
  formatCoinAmount,
  formatEthAmount,
  formatZigAmount,
  shortened,
} from '../../helpers';
import { SendTransaction } from '../Transaction/SendTransaction';
import { TransactionPasscode } from '../Transaction/TransactionPasscode';
import {
  WalletCardStyle,
  walletCardStyleTransition,
} from '../WalletCardWrapper';
import { Balance } from './Balance';
import { SendReceiveButtons } from './SendReceiveButtons';

const BreadCrumb = styled(Text.Body)`
  transition: var(--transition);

  &:hover {
    transition: var(--transition);
    text-decoration: underline;
  }
`;

const AddressStyle = styled(Flex)`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-radius: 7px;
  gap: 6px;
  background: rgba(var(--rlm-overlay-hover-rgba));
`;

type Props = {
  coinView?: any | null;
  wallet: EthWalletType | BitcoinWalletType;
  coin: ERC20Type | null;
  QROpen: boolean;
  setQROpen: (open: boolean) => void;
  hideWalletHero: boolean;
  sendTrans: boolean;
  onScreenChange: any;
  setSendTrans: any;
  close: any;
};

const DetailHeroPresenter = ({
  wallet,
  coin,
  coinView,
  QROpen,
  setQROpen,
  hideWalletHero,
  sendTrans,
  onScreenChange,
  setSendTrans,
  close,
}: Props) => {
  const { walletStore } = useShipStore();
  const [showPasscode, setShowPasscode] = useState(false);

  const amountDisplay =
    walletStore.navState.network === NetworkType.ETHEREUM
      ? !coin
        ? walletStore.navState.protocol === ProtocolType.UQBAR
          ? `${formatZigAmount(
              (wallet as EthWalletType).data.get(walletStore.navState.protocol)
                ?.balance ?? ''
            )} zigs`
          : `${
              formatEthAmount(
                (wallet as EthWalletType).data.get(
                  walletStore.navState.protocol
                )?.balance ?? ''
              ).eth
            } ETH`
        : `${formatCoinAmount(coin.balance, coin.decimals).display} ${
            coin.name
          }`
      : `${formatBtcAmount((wallet as BitcoinWalletType).balance).btc} BTC`;

  const amountUsdDisplay =
    walletStore.navState.network === 'ethereum'
      ? !coin
        ? walletStore.ethereum.conversions.usd
          ? '$' +
            `${convertEthAmountToUsd(
              formatEthAmount(
                (wallet as EthWalletType).data.get(
                  walletStore.navState.protocol
                )?.balance ?? ''
              ),
              walletStore.ethereum.conversions.usd
            )}`
          : ''
        : coin.conversions.usd
        ? '$' +
          `${convertERC20AmountToUsd(
            formatCoinAmount(coin.balance, coin.decimals),
            coin.conversions.usd
          )}`
        : ''
      : walletStore.bitcoin.conversions.usd
      ? '$' +
        `${convertBtcAmountToUsd(
          formatBtcAmount((wallet as BitcoinWalletType).balance),
          walletStore.bitcoin.conversions.usd
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
      mt={2}
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
          onClick={walletStore.navigateBack}
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
  const [transactionRecipient, setTransactionRecipient] = useState<{
    address?: string;
    patp?: string;
    patpAddress?: string;
    color?: string;
  }>({});

  const sendTransaction = async (passcode: number[]) => {
    try {
      if (walletStore.navState.network === NetworkType.ETHEREUM) {
        if (walletStore.navState.protocol === ProtocolType.UQBAR) {
          // await walletStore.submitUqbarTransaction(
          //   walletStore.currentWallet?.index.toString() ?? '',
          //   passcode
          // );
        } else {
          coin
            ? await walletStore.sendERC20Transaction(
                walletStore.currentWallet?.index.toString() ?? '',
                transactionRecipient.address ??
                  transactionRecipient.patpAddress ??
                  '',
                transactionAmount.toString(),
                coin.address,
                passcode,
                transactionRecipient.patp
              )
            : await walletStore.sendEthereumTransaction(
                walletStore.currentWallet?.index.toString() ?? '',
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

  return showPasscode ? (
    <TransactionPasscode
      checkPasscode={walletStore.checkPasscode}
      onSuccess={(code: number[]) => {
        sendTransaction(code);
      }}
    />
  ) : (
    <WalletCardStyle
      transition={walletCardStyleTransition}
      width="100%"
      isSelected
    >
      <Flex
        style={{ height: QROpen ? 242 : 38 }}
        borderRadius="8px"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="center"
      >
        <AddressStyle>
          <Flex>
            {walletStore.navState.network === NetworkType.ETHEREUM ? (
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
                <Box onClick={() => setQROpen(!QROpen)}>
                  <Icon name="QRCode" />
                </Box>
              </Flex>
            )}
          </Flex>
        </AddressStyle>
        <Box mt={2} width="100%" height={204} hidden={!QROpen}>
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
      <Flex
        flexDirection="row"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 1 }}
        transition={walletCardStyleTransition}
      >
        <SendReceiveButtons
          hidden={sendTrans}
          send={() => setSendTrans(true)}
          receive={() => setQROpen(true)}
        />
        <SendTransaction
          wallet={wallet}
          hidden={!sendTrans}
          onScreenChange={onScreenChange}
          close={close}
          coin={coin}
          onConfirm={() => setShowPasscode(true)}
          setTransactionAmount={setTransactionAmount}
          transactionAmount={transactionAmount}
          setTransactionRecipient={setTransactionRecipient}
          transactionRecipient={transactionRecipient}
        />
      </Flex>
      {coinView}
    </WalletCardStyle>
  );
};

export const DetailHero = observer(DetailHeroPresenter);
