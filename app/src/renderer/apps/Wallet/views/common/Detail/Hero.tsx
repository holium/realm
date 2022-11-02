import { FC, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { darken, lighten } from 'polished';
import { QRCodeSVG } from 'qrcode.react';

import { Flex, Box, Icons, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import {
  shortened,
  formatEthAmount,
  getBaseTheme,
  getMockCoinIcon,
  formatCoinAmount,
} from '../../../lib/helpers';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { ERC20Type, WalletView } from 'os/services/tray/wallet.model';
import { ThemeModelType } from 'os/services/theme.model';
import { CircleButton } from '../../../components/CircleButton';
import { SendTransaction } from '../Transaction/Send';
import {
  EthWalletType,
  BitcoinWalletType,
} from 'os/services/tray/wallet.model';

const usdc = {
  ticker: 'USDC',
  amount: '5765.2',
  icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
};

const FlexWithShadow = styled(Flex)`
  box-shadow: 0px 0px 9px rgba(0, 0, 0, 0.12);
`;

interface DetailHeroProps {
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

    const themeData = getBaseTheme(theme.currentTheme);
    const panelBorder = darken(0.08, theme.currentTheme!.windowColor);

    let amountDisplay = !props.coin
      ? `${formatEthAmount(props.wallet.balance).eth} ETH`
      : `${formatCoinAmount(props.coin.balance, props.coin.decimals).display} ${
          props.coin.name
        }`;

    let accountDisplay = !props.coin ? (
      props.wallet.nickname
    ) : (
      <Flex
        onClick={() =>
          WalletActions.setView(
            WalletView.WALLET_DETAIL,
            undefined,
            undefined,
            true
          )
        }
      >
        <Icons
          name="ArrowLeftLine"
          size={2}
          mr={2}
          color={theme.currentTheme.iconColor}
        />
        {props.wallet.nickname} /{' '}
        <span
          style={{ color: themeData.colors.text.secondary, marginLeft: '4px' }}
        >
          {props.coin.name}
        </span>
      </Flex>
    );

    return (
      <FlexWithShadow
        p={3}
        width="100%"
        flexDirection="column"
        background={lighten(0.02, theme.currentTheme.windowColor)}
        borderRadius="16px"
      >
        <Flex
          p={2}
          width="100%"
          background={darken(0.03, theme.currentTheme.windowColor)}
          border={`solid 1px ${panelBorder}`}
          borderRadius="8px"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Flex width="100%" justifyContent="space-between">
            <Flex>
              <Icons name="Ethereum" height="20px" mr={2} />
              <Text pt="2px" textAlign="center" fontSize="14px">
                {shortened(props.wallet!.address)}
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
                    content={props.wallet!.address}
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
          <Box width="100%" hidden={!props.QROpen}>
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
                value={props.wallet!.address}
              />
            </Flex>
          </Box>
        </Flex>
        <Box p={2} width="100%" hidden={props.hideWalletHero}>
          <Flex
            mt={2}
            opacity={0.5}
            fontWeight={600}
            color={lighten(0.04, themeData.colors.text.secondary)}
            style={{ textTransform: 'uppercase' }}
            animate={false}
          >
            {accountDisplay}
          </Flex>
          <Balance
            coin={props.coin!}
            amountDisplay={amountDisplay}
            colors={themeData.colors}
          />
        </Box>
        {/* @ts-ignore */}
        <SendReceiveButtons
          hidden={props.sendTrans}
          windowColor={theme.currentTheme.windowColor}
          send={() => props.setSendTrans(true)}
          receive={() => props.setQROpen(true)}
        />
        <SendTransaction
          wallet={props.wallet!}
          hidden={!props.sendTrans}
          onScreenChange={props.onScreenChange}
          close={props.close}
          coin={props.coin}
        />
      </FlexWithShadow>
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

function SendReceiveButtons(props: {
  hidden: boolean;
  windowColor: string;
  send: any;
  receive: any;
}) {
  let panelBackground = darken(0.04, props.windowColor);

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
}

interface BalanceInterface {
  coin?: ERC20Type;
  amountDisplay: string;
  colors: any;
}
function Balance(props: BalanceInterface) {
  let coinIcon = props.coin
    ? props.coin.logo || getMockCoinIcon(props.coin.name)
    : '';
  return !props.coin ? (
    <Text opacity={0.9} fontWeight={600} fontSize={7} animate={false}>
      {props.amountDisplay}
    </Text>
  ) : (
    <Flex
      mt={1}
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <img height="26px" src={coinIcon} />
      <Text mt={1} opacity={0.9} fontWeight={600} fontSize={5} animate={false}>
        {props.amountDisplay}
      </Text>
      <Text variant="body" color={props.colors.text.secondary}>
        $12,345.98
      </Text>
    </Flex>
  );
}
