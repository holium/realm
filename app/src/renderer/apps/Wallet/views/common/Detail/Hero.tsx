import { FC, useState, useMemo } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { darken, lighten, rgba } from 'polished';
import { QRCodeSVG } from 'qrcode.react';

import { Flex, Box, Icons, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import {
  shortened,
  formatEthAmount,
  formatZigAmount,
  getBaseTheme,
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
  WalletView,
} from 'os/services/tray/wallet-lib/wallet.model';
import { CircleButton } from '../../../components/CircleButton';
import { SendTransaction } from '../Transaction/Send';
import { useTrayApps } from 'renderer/apps/store';
import { motion } from 'framer-motion';
import { WalletActions } from 'renderer/logic/actions/wallet';
import {
  WalletCardStyle,
  walletCardStyleTransition,
} from '../../../components/WalletCardWrapper';
import TransactionPasscode from '../Transaction/TransactionPasscode';

const BreadCrumb = styled(Text)`
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
    const { theme } = useServices();
    const { walletApp } = useTrayApps();
    const { coinView } = props;

    const themeData = getBaseTheme(theme.currentTheme);
    const panelBorder = darken(0.08, theme.currentTheme.windowColor);
    const fadedTextColor = useMemo(
      () => rgba(theme.currentTheme.textColor, 0.4),
      [theme.currentTheme.textColor]
    );

    const [showPasscode, setShowPasscode] = useState(false);
    const [passcode, setPasscode] = useState<number[]>([]);

    const amountDisplay =
      walletApp.navState.network === NetworkType.ETHEREUM
        ? !props.coin
          ? walletApp.navState.protocol === ProtocolType.UQBAR
          ? `${
              formatZigAmount(
                (props.wallet as EthWalletType).data.get(
                  walletApp.navState.protocol
                )!.balance
              )
            } zigs`
          : `${
              formatEthAmount(
                (props.wallet as EthWalletType).data.get(
                  walletApp.navState.protocol
                )!.balance
              ).eth
            } ETH`
          : `${
              formatCoinAmount(props.coin.balance, props.coin.decimals).display
            } ${props.coin.name}`
        : `${
            formatBtcAmount((props.wallet as BitcoinWalletType).balance).btc
          } BTC`;
    const amountUsdDisplay =
      walletApp.navState.network === 'ethereum'
        ? !props.coin
          ? walletApp.ethereum.conversions.usd
            ? '$' +
              `${convertEthAmountToUsd(
                formatEthAmount(
                  (props.wallet as EthWalletType).data.get(
                    walletApp.navState.protocol
                  )!.balance
                ),
                walletApp.ethereum.conversions.usd
              )}`
            : ''
          : props.coin.conversions.usd
          ? '$' +
            `${convertERC20AmountToUsd(
              formatCoinAmount(props.coin.balance, props.coin.decimals),
              props.coin.conversions.usd
            )}`
          : ''
        : walletApp.bitcoin.conversions.usd
        ? '$' +
          `${convertBtcAmountToUsd(
            formatBtcAmount((props.wallet as BitcoinWalletType).balance),
            walletApp.bitcoin.conversions.usd
          )}`
        : '';

    const accountDisplay = !props.coin ? (
      <Text
        layoutId={`wallet-name-${props.wallet.address}`}
        layout="position"
        transition={walletCardStyleTransition}
        mt={2}
        fontWeight={600}
        color={fadedTextColor}
        style={{ textTransform: 'uppercase' }}
      >
        {props.wallet.nickname}
      </Text>
    ) : (
      <Flex
        mt={2}
        // layoutId={`wallet-name-${props.wallet.address}`}
        layout="position"
        alignItems="center"
        gap={8}
        transition={walletCardStyleTransition}
      >
        <Flex flexDirection="row" alignItems="center">
          <BreadCrumb
            fontWeight={500}
            fontSize={2}
            color={fadedTextColor}
            style={{ textTransform: 'uppercase' }}
            onClick={WalletActions.navigateBack}
          >
            {`${props.wallet.nickname}`}
          </BreadCrumb>
          <Text
            pl="2px"
            fontWeight={500}
            fontSize={2}
            color={fadedTextColor}
          >{` / `}</Text>

          <Text
            fontSize={2}
            style={{
              color: themeData.colors.text.secondary,
              marginLeft: '4px',
            }}
          >
            {props.coin.name}
          </Text>
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
        if (walletApp.navState.network === NetworkType.ETHEREUM) {
          if (walletApp.navState.protocol === ProtocolType.UQBAR) {
            await WalletActions.sendUqbarTransaction(
              walletApp.currentWallet!.index.toString(),
              passcode
            )
          }
          else {
            props.coin
              ? await WalletActions.sendERC20Transaction(
                  walletApp.currentWallet!.index.toString(),
                  transactionRecipient.address ||
                    transactionRecipient.patpAddress!,
                  transactionAmount.toString(),
                  props.coin.address,
                  passcode,
                  transactionRecipient.patp
                )
              : await WalletActions.sendEthereumTransaction(
                  walletApp.currentWallet!.index.toString(),
                  transactionRecipient.address ||
                    transactionRecipient.patpAddress!,
                  transactionAmount.toString(),
                  passcode,
                  transactionRecipient.patp
                );
          }
        } else {
          await WalletActions.sendBitcoinTransaction(
            walletApp.currentWallet!.index,
            transactionRecipient.address || transactionRecipient.patpAddress!,
            transactionAmount.toString()
          );
        }
        props.close();
      } catch (e) {
        console.error(e);
      }
    }

    return (
      showPasscode ? <TransactionPasscode onSuccess={(code: number[]) => {
        sendTransaction(code)
      }
      } /> :
      <WalletCardStyle
        layout="size"
        elevation="none"
        layoutId={`wallet-card-${props.wallet.address}`}
        transition={walletCardStyleTransition}
        pb="8px"
        px="12px"
        minHeight="220px"
        height="auto"
        width="100%"
        isSelected
        mode={theme.currentTheme.mode}
        customBg={lighten(0.04, theme.currentTheme.windowColor)}
        borderColor={
          theme.currentTheme.mode === 'dark'
            ? darken(0.1, theme.currentTheme.backgroundColor)
            : darken(0.1, theme.currentTheme.windowColor)
        }
      >
        <Flex
          p={2}
          layout="position"
          width="100%"
          minHeight="38px"
          style={{ height: props.QROpen ? 242 : 38 }}
          background={
            theme.currentTheme.mode === 'dark'
              ? lighten(0.025, theme.currentTheme.inputColor)
              : darken(0.025, theme.currentTheme.inputColor)
          }
          border={`solid 1px ${panelBorder}`}
          borderRadius="8px"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="center"
        >
          <Flex width="100%" justifyContent="space-between" alignItems="center">
            <Flex>
              {walletApp.navState.network === NetworkType.ETHEREUM ? (
                <Icons name="Ethereum" height="20px" mr={2} />
              ) : (
                <Icons name="Bitcoin" height="20px" mr={2} />
              )}
              <Text pt="2px" textAlign="center" fontSize="14px">
                {shortened(props.wallet.address)}
              </Text>
            </Flex>
            <Flex>
              {props.sendTrans ? (
                <Icons
                  name="ChevronDown"
                  color={themeData.colors.text.disabled}
                />
              ) : (
                <>
                  <CopyButton
                    content={props.wallet.address}
                    colors={themeData.colors}
                  />
                  <Box onClick={() => props.setQROpen(!props.QROpen)}>
                    <Icons
                      ml={2}
                      name="QRCode"
                      height="20px"
                      color={
                        props.QROpen
                          ? themeData.colors.brand.primary
                          : themeData.colors.text.disabled
                      }
                    />
                  </Box>
                </>
              )}
            </Flex>
          </Flex>
          <Box width="100%" height={204} hidden={!props.QROpen}>
            <Flex
              mt={1}
              p={3}
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
          py={2}
          width="100%"
          hidden={props.hideWalletHero}
        >
          {accountDisplay}
          <Balance
            address={props.wallet.address}
            coin={props.coin!}
            amountDisplay={amountDisplay}
            amountUsdDisplay={amountUsdDisplay}
            colors={themeData.colors}
          />
        </Box>
        <Flex
          flexDirection="row"
          layout="position"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={walletCardStyleTransition}
          // padding="15px 12px"
          pb="15px"
        >
          <SendReceiveButtons
            hidden={props.sendTrans}
            windowColor={theme.currentTheme.windowColor}
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

interface CopyProps {
  content: string;
  colors: any;
}
function CopyButton(props: CopyProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(props.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 750);
  };

  return (
    <Box>
      {!copied ? (
        <Box onClick={copy}>
          <Icons name="Copy" height="20px" color={props.colors.text.disabled} />
        </Box>
      ) : (
        <Icons
          name="CheckCircle"
          height="20px"
          color={props.colors.ui.intent.success}
        />
      )}
    </Box>
  );
}

const SendReceiveButtons = (props: {
  hidden: boolean;
  windowColor: string;
  send: any;
  receive: any;
}) => {
  const panelBackground = darken(0.04, props.windowColor);

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
            <CircleButton
              icon="Receive"
              title="Receive"
              iconColor={panelBackground}
            />
          </Box>
          <Box onClick={props.send}>
            <CircleButton
              icon="Send"
              title="Send"
              iconColor={panelBackground}
            />
          </Box>
        </Flex>
      </Box>
    ),
    [props]
  );
};

interface BalanceInterface {
  address: string;
  coin?: ERC20Type;
  amountDisplay: string;
  amountUsdDisplay: string;
  colors: any;
}
function Balance(props: BalanceInterface) {
  const coinIcon = props.coin
    ? props.coin.logo || getMockCoinIcon(props.coin.name)
    : '';
  return !props.coin ? (
    <>
      <Text
        mt={1}
        layout="position"
        transition={walletCardStyleTransition}
        layoutId={`wallet-balance-${props.address}`}
        fontWeight={600}
        fontSize={7}
      >
        {props.amountDisplay}
      </Text>
      <Text
        mt={1}
        layout="position"
        layoutId={`wallet-usd-${props.address}`}
        transition={walletCardStyleTransition}
        variant="body"
        color={props.colors.text.secondary}
      >
        {props.amountUsdDisplay}
      </Text>
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
      <Text
        mt={1}
        layout="position"
        layoutId={`wallet-coin-balance`}
        opacity={0.9}
        fontWeight={600}
        fontSize={5}
      >
        {props.amountDisplay}
      </Text>
      <Text
        mt={1}
        layout="position"
        layoutId={`wallet-coin-usd`}
        variant="body"
        color={props.colors.text.secondary}
      >
        {props.amountUsdDisplay}
      </Text>
    </Flex>
  );
}
