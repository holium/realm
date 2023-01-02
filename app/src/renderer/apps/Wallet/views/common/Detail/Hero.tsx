import { FC, useState, memo } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { darken, lighten, rgba } from 'polished';
import { QRCodeSVG } from 'qrcode.react';

import { Flex, Box, Icons, Text, Card } from 'renderer/components';
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
} from 'os/services/tray/wallet-lib/wallet.model';
import { CircleButton } from '../../../components/CircleButton';
import { SendTransaction } from '../Transaction/Send';
import { useTrayApps } from 'renderer/apps/store';
import { motion } from 'framer-motion';
// import { CoinList } from './CoinList';

const CardWithShadow = styled(Card)`
  box-shadow: 0px 0px 9px rgba(0, 0, 0, 0.1);
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

const transitionConfig = {
  layout: { duration: 0.1 },
  // opacity: { ease: 'smooth' },
};

export const DetailHero: FC<DetailHeroProps> = observer(
  (props: DetailHeroProps) => {
    const { theme } = useServices();
    const { walletApp } = useTrayApps();
    const { coinView } = props;

    const themeData = getBaseTheme(theme.currentTheme);
    const panelBorder = darken(0.08, theme.currentTheme.windowColor);

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
      <Flex
        layoutId={`wallet-name-${props.wallet.address}`}
        layout="position"
        transition={transitionConfig}
        mt={2}
        fontWeight={600}
        color={rgba(theme.currentTheme.textColor, 0.4)}
        style={{ textTransform: 'uppercase' }}
      >
        {props.wallet.nickname}
      </Flex>
    ) : (
      <Flex
        mt={2}
        layoutId={`wallet-name-${props.wallet.address}`}
        layout="position"
        alignItems="center"
        gap={8}
        transition={transitionConfig}
      >
        {/* <IconButton onClick={async () => await WalletActions.navigateBack()}>
          <Icons
            name="ArrowLeftLine"
            size={1}
            color={theme.currentTheme.iconColor}
          />
        </IconButton> */}
        <Flex flexDirection="row" alignItems="center">
          <Text
            fontWeight={500}
            fontSize={2}
            color={rgba(theme.currentTheme.textColor, 0.4)}
            style={{ textTransform: 'uppercase' }}
          >
            {`${props.wallet.nickname} / `}
          </Text>

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

    return (
      <CardWithShadow
        layout="size"
        layoutId={`wallet-card-${props.wallet.address}`}
        transition={transitionConfig}
        padding="16px 12px"
        minHeight="240px"
        height="auto"
        width="100%"
        flexDirection="column"
        justifyContent="flex-start"
        customBg={lighten(0.04, theme.currentTheme.windowColor)}
        borderColor={
          theme.currentTheme.mode === 'dark'
            ? darken(0.1, theme.currentTheme.backgroundColor)
            : darken(0.1, theme.currentTheme.windowColor)
        }
        borderRadius="16px"
      >
        <Flex
          p={2}
          width="100%"
          minHeight="38px"
          transition={transitionConfig}
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
          transition={transitionConfig}
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
          layoutId={`wallet-buttons-${props.wallet.address}`}
          // mt={props.coin ? 0 : 3}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transitionConfig}
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
          />
        </Flex>
        {coinView}
      </CardWithShadow>
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

const SendReceiveButtons = memo((props: {
  hidden: boolean;
  windowColor: string;
  send: any;
  receive: any;
}) => {
  const panelBackground = darken(0.04, props.windowColor);

  return (
    <Box width="100%" hidden={props.hidden}>
      <Flex mt="12px" width="100%" justifyContent="center" alignItems="center">
        <Box mr="16px" onClick={props.receive}>
          <CircleButton
            icon="Receive"
            title="Receive"
            iconColor={panelBackground}
          />
        </Box>
        <Box onClick={props.send}>
          <CircleButton icon="Send" title="Send" iconColor={panelBackground} />
        </Box>
      </Flex>
    </Box>
  );
})

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
        transition={transitionConfig}
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
        transition={transitionConfig}
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
      transition={transitionConfig}
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <motion.img layout="position" height="26px" src={coinIcon} />
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
