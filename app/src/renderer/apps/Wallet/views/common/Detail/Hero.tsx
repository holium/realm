import { FC, useState, useMemo } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { QRCodeSVG } from 'qrcode.react';
import { CopyButton, Flex, Box, Icon, Text } from '@holium/design-system';

import {
  shortened,
  formatEthAmount,
  formatZigAmount,
  getMockCoinIcon,
  formatCoinAmount,
  convertBtcAmountToUsd,
  convertEthAmountToUsd,
  convertERC20AmountToUsd,
  formatBtcAmount,
} from '../../../lib/helpers';
import {
  ERC20Type,
  EthWalletType,
  BitcoinWalletType,
  NetworkType,
  ProtocolType,
} from 'renderer/stores/models/wallet.model';
import { CircleButton } from '../../../components/CircleButton';
import { SendTransaction } from '../Transaction/Send';
import { motion } from 'framer-motion';
import {
  WalletCardStyle,
  walletCardStyleTransition,
} from '../../../components/WalletCardWrapper';
import { TransactionPasscode } from '../Transaction/TransactionPasscode';
import { useShipStore } from 'renderer/stores/ship.store';

const BreadCrumb = styled(Text.Body)`
  transition: var(--transition);

  &:hover {
    transition: var(--transition);
    text-decoration: underline;
  }
`;

interface DetailHeroProps {
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
  qr?: {
    open: boolean;
    set: any;
  };
  transaction?: {
    open: boolean;
    set: any;
    close: any;
  };
}

export const DetailHero: FC<DetailHeroProps> = observer(
  (props: DetailHeroProps) => {
    const { walletStore } = useShipStore();
    const { coinView } = props;

    const [showPasscode, setShowPasscode] = useState(false);

    const amountDisplay =
      walletStore.navState.network === NetworkType.ETHEREUM
        ? !props.coin
          ? walletStore.navState.protocol === ProtocolType.UQBAR
            ? `${formatZigAmount(
                (props.wallet as EthWalletType).data.get(
                  walletStore.navState.protocol
                )?.balance ?? ''
              )} zigs`
            : `${
                formatEthAmount(
                  (props.wallet as EthWalletType).data.get(
                    walletStore.navState.protocol
                  )?.balance ?? ''
                ).eth
              } ETH`
          : `${
              formatCoinAmount(props.coin.balance, props.coin.decimals).display
            } ${props.coin.name}`
        : `${
            formatBtcAmount((props.wallet as BitcoinWalletType).balance).btc
          } BTC`;

    const amountUsdDisplay =
      walletStore.navState.network === 'ethereum'
        ? !props.coin
          ? walletStore.ethereum.conversions.usd
            ? '$' +
              `${convertEthAmountToUsd(
                formatEthAmount(
                  (props.wallet as EthWalletType).data.get(
                    walletStore.navState.protocol
                  )?.balance ?? ''
                ),
                walletStore.ethereum.conversions.usd
              )}`
            : ''
          : props.coin.conversions.usd
          ? '$' +
            `${convertERC20AmountToUsd(
              formatCoinAmount(props.coin.balance, props.coin.decimals),
              props.coin.conversions.usd
            )}`
          : ''
        : walletStore.bitcoin.conversions.usd
        ? '$' +
          `${convertBtcAmountToUsd(
            formatBtcAmount((props.wallet as BitcoinWalletType).balance),
            walletStore.bitcoin.conversions.usd
          )}`
        : '';

    const accountDisplay = !props.coin ? (
      <Text.Body
        layoutId={`wallet-name-${props.wallet.address}`}
        layout="position"
        transition={walletCardStyleTransition}
        mt={2}
        fontWeight={600}
        style={{ textTransform: 'uppercase' }}
      >
        {props.wallet.nickname}
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
            {`${props.wallet.nickname}`}
          </BreadCrumb>
          <Text.Body pl="2px" fontWeight={500} fontSize={2}>{` / `}</Text.Body>
          <Text.Body
            fontSize={2}
            style={{
              marginLeft: '4px',
            }}
          >
            {props.coin.name}
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
            await walletStore.submitUqbarTransaction(
              walletStore.currentWallet?.index.toString() ?? '',
              passcode
            );
          } else {
            props.coin
              ? await walletStore.sendERC20Transaction(
                  walletStore.currentWallet?.index.toString() ?? '',
                  transactionRecipient.address ??
                    transactionRecipient.patpAddress ??
                    '',
                  transactionAmount.toString(),
                  props.coin.address,
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

        props.close();
      } catch (e) {
        console.error(e);
      }
    };

    return showPasscode ? (
      <TransactionPasscode
        onSuccess={(code: number[]) => {
          sendTransaction(code);
        }}
      />
    ) : (
      <WalletCardStyle
        layout="size"
        layoutId={`wallet-card-${props.wallet.address}`}
        transition={walletCardStyleTransition}
        pb="8px"
        px="12px"
        // minHeight="220px"
        height="auto"
        width="100%"
        isSelected
      >
        <Flex
          layout="position"
          width="100%"
          style={{ height: props.QROpen ? 242 : 38 }}
          borderRadius="8px"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="center"
          gap={10}
        >
          <Flex width="100%" justifyContent="space-between" alignItems="center">
            <Flex>
              {walletStore.navState.network === NetworkType.ETHEREUM ? (
                <Icon name="Ethereum" mr={2} />
              ) : (
                <Icon name="Bitcoin" mr={2} />
              )}
              <Text.Body pt="2px" textAlign="center" fontSize="14px">
                {shortened(props.wallet.address)}
              </Text.Body>
            </Flex>
            <Flex>
              {props.sendTrans ? (
                <Icon name="ChevronDown" />
              ) : (
                <Flex gap={10}>
                  <CopyButton content={props.wallet.address} />
                  <Box onClick={() => props.setQROpen(!props.QROpen)}>
                    <Icon name="QRCode" />
                  </Box>
                </Flex>
              )}
            </Flex>
          </Flex>
          <Box width="100%" height={204} hidden={!props.QROpen}>
            <Flex
              width="100%"
              height="200px"
              justifyContent="center"
              alignItems="center"
            >
              <QRCodeSVG
                width="100%"
                height="100%"
                value={props.wallet.address}
              />
            </Flex>
          </Box>
        </Flex>
        <Box
          layout="position"
          transition={walletCardStyleTransition}
          width="100%"
          hidden={props.hideWalletHero}
        >
          {accountDisplay}
          <Balance
            address={props.wallet.address}
            coin={props.coin}
            amountDisplay={amountDisplay}
            amountUsdDisplay={amountUsdDisplay}
          />
        </Box>
        <Flex
          flexDirection="row"
          layout="position"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={walletCardStyleTransition}
        >
          <SendReceiveButtons
            hidden={props.sendTrans}
            send={() => props.setSendTrans(true)}
            receive={() => props.setQROpen(true)}
          />
          <SendTransaction
            wallet={props.wallet}
            hidden={!props.sendTrans}
            onScreenChange={props.onScreenChange}
            close={props.close}
            coin={props.coin}
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
  }
);

const SendReceiveButtons = (props: {
  hidden: boolean;
  send: any;
  receive: any;
}) => {
  return useMemo(
    () => (
      <Box width="100%" hidden={props.hidden}>
        <Flex
          mt="12px"
          width="100%"
          justifyContent="center"
          alignItems="center"
        >
          <Box mr="16px" onClick={props.receive}>
            <CircleButton icon="Receive" title="Receive" />
          </Box>
          <Box onClick={props.send}>
            <CircleButton icon="Send" title="Send" />
          </Box>
        </Flex>
      </Box>
    ),
    [props]
  );
};

interface BalanceInterface {
  address: string;
  coin: ERC20Type | null;
  amountDisplay: string;
  amountUsdDisplay: string;
}
function Balance(props: BalanceInterface) {
  const coinIcon = props.coin
    ? props.coin.logo || getMockCoinIcon(props.coin.name)
    : '';
  return !props.coin ? (
    <>
      <Text.Body
        mt={1}
        layout="position"
        transition={walletCardStyleTransition}
        layoutId={`wallet-balance-${props.address}`}
        fontWeight={600}
        fontSize={7}
      >
        {props.amountDisplay}
      </Text.Body>
      <Text.Body
        mt={1}
        layout="position"
        layoutId={`wallet-usd-${props.address}`}
        transition={walletCardStyleTransition}
        variant="body"
      >
        {props.amountUsdDisplay}
      </Text.Body>
    </>
  ) : (
    <Flex
      mt={1}
      layout="position"
      transition={walletCardStyleTransition}
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Flex width={26} height={26}>
        <motion.img height="26px" src={coinIcon} />
      </Flex>
      <Text.Body
        mt={1}
        layout="position"
        layoutId={`wallet-coin-balance`}
        opacity={0.9}
        fontWeight={600}
        fontSize={5}
      >
        {props.amountDisplay}
      </Text.Body>
      <Text.Body
        mt={1}
        layout="position"
        layoutId={`wallet-coin-usd`}
        variant="body"
      >
        {props.amountUsdDisplay}
      </Text.Body>
    </Flex>
  );
}
