import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import { QRCodeSVG } from 'qrcode.react';

import { Box, Flex, Icon, Text } from '@holium/design-system';

import { EthWalletType } from 'renderer/stores/models/wallet.model';

import { formatEthAmount, shortened } from '../../../lib/helpers';

interface WalletInfoProps {
  wallet: EthWalletType;
  QROpen: boolean;
  setQROpen: (open: boolean) => void;
  hideWalletHero: boolean;
  sendTrans: boolean;
}

export const WalletInfo: FC<WalletInfoProps> = observer(
  (props: WalletInfoProps) => {
    // TODO clean up everything
    const amountDisplay = `${
      // @ts-ignore
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
              <Icon name="Copy" height="20px" />
            </Box>
          ) : (
            <Icon name="CheckCircle" height="20px" />
          )}
        </Box>
      );
    };

    return (
      <Flex
        p={2}
        width="100%"
        borderRadius="8px"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Flex width="100%" justifyContent="space-between">
          <Flex>
            {/*(typeof props.wallet) === EthWalletType
            ? <Icons name="Ethereum" height="20px" mr={2} />
            : <Icons name="Bitcoin" height="20px" mr={2} />
    */}
            <Icon name="Bitcoin" height="20px" mr={2} />
            <Text.Body pt="2px" textAlign="center" fontSize="14px">
              {props.wallet && shortened(props.wallet.address)}
            </Text.Body>
          </Flex>
          <Flex>
            {props.sendTrans ? (
              <Icon name="ChevronDown" />
            ) : (
              <>
                <CopyButton content={props.wallet && props.wallet.address} />
                <Box onClick={() => props.setQROpen(!props.QROpen)}>
                  <Icon ml={2} name="QRCode" height="20px" />
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
              // width="100%"
              // height="100%"
              value={props.wallet.address}
            />
          </Flex>
        </Box>
        <Box p={2} width="100%" hidden={props.hideWalletHero}>
          <Text.Body
            mt={3}
            opacity={0.5}
            fontWeight={600}
            style={{ textTransform: 'uppercase' }}
            animate={false}
          >
            {props.wallet.nickname}
          </Text.Body>
          <Text.Body
            opacity={0.9}
            fontWeight={600}
            fontSize={7}
            animate={false}
          >
            {amountDisplay}
          </Text.Body>
        </Box>
      </Flex>
    );
  }
);
