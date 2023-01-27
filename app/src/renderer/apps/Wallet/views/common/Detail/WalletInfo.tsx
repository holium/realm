import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { darken } from 'polished';
import { QRCodeSVG } from 'qrcode.react';

import { Flex, Box, Icons, Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { shortened, formatEthAmount, getBaseTheme } from '../../../lib/helpers';
import {
  EthWalletType,
  BitcoinWalletType,
} from 'os/services/tray/wallet-lib/wallet.model';

interface WalletInfoProps {
  wallet: EthWalletType | BitcoinWalletType;
  QROpen: boolean;
  setQROpen: (open: boolean) => void;
  hideWalletHero: boolean;
  sendTrans: boolean;
}

export const WalletInfo: FC<WalletInfoProps> = observer(
  (props: WalletInfoProps) => {
    const { theme } = useServices();

    const themeData = getBaseTheme(theme.currentTheme);
    const panelBorder = darken(0.08, theme.currentTheme.windowColor);
    const amountDisplay = `${
      formatEthAmount(props.wallet ? props.wallet.balance : '0.0').eth
    } ETH`;

    const CopyButton: FC<{ content: string }> = (props: {
      content: string;
    }) => {
      const [copied, setCopied] = useState(false);

      function copy() {
        navigator.clipboard.writeText(props.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 750);
      }

      return (
        <Box>
          {!copied ? (
            <Box onClick={copy}>
              <Icons
                name="Copy"
                height="20px"
                color={themeData.colors.text.disabled}
              />
            </Box>
          ) : (
            <Icons
              name="CheckCircle"
              height="20px"
              color={themeData.colors.ui.intent.success}
            />
          )}
        </Box>
      );
    };

    return (
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
            <Text>aowsiehtoishrtoiwheotiwhet</Text>
            {/*(typeof props.wallet) === EthWalletType
            ? <Icons name="Ethereum" height="20px" mr={2} />
            : <Icons name="Bitcoin" height="20px" mr={2} />
    */}
            <Icons name="Bitcoin" height="20px" mr={2} />
            <Text pt="2px" textAlign="center" fontSize="14px">
              {props.wallet && shortened(props.wallet.address)}
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
                <CopyButton content={props.wallet && props.wallet.address} />
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
              value={props.wallet.address}
            />
          </Flex>
        </Box>
        <Box p={2} width="100%" hidden={props.hideWalletHero}>
          <Text
            mt={3}
            opacity={0.5}
            fontWeight={600}
            color={themeData.colors.text.tertiary}
            style={{ textTransform: 'uppercase' }}
            animate={false}
          >
            {props.wallet.nickname}
          </Text>
          <Text opacity={0.9} fontWeight={600} fontSize={7} animate={false}>
            {amountDisplay}
          </Text>
        </Box>
      </Flex>
    );
  }
);
