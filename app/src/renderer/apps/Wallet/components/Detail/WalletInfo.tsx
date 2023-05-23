import { observer } from 'mobx-react';
import { QRCodeSVG } from 'qrcode.react';

import {
  Box,
  CopyButton,
  Flex,
  Icon,
  Text,
} from '@holium/design-system/general';

import { EthWalletType } from 'renderer/stores/models/wallet.model';

import { formatEthAmount, shortened } from '../../helpers';

type Props = {
  wallet: EthWalletType;
  QROpen: boolean;
  sendTrans: boolean;
  setQROpen: (open: boolean) => void;
};

const WalletInfoPresenter = ({
  wallet,
  QROpen,
  sendTrans,
  setQROpen,
}: Props) => {
  const amountDisplay = `${
    // @ts-ignore
    formatEthAmount(wallet ? wallet.balance : '0.0').eth
  } ETH`;

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
          {/*(typeof wallet) === EthWalletType
            ? <Icons name="Ethereum" height="20px" mr={2} />
            : <Icons name="Bitcoin" height="20px" mr={2} />
          */}
          <Icon name="Bitcoin" height="20px" mr={2} />
          <Text.Body pt="2px" textAlign="center" fontSize="14px">
            {wallet && shortened(wallet.address)}
          </Text.Body>
        </Flex>
        <Flex>
          {sendTrans ? (
            <Icon name="ChevronDown" />
          ) : (
            <>
              <CopyButton content={wallet && wallet.address} />
              <Box onClick={() => setQROpen(!QROpen)}>
                <Icon ml={2} name="QRCode" height="20px" />
              </Box>
            </>
          )}
        </Flex>
      </Flex>
      <Box width="100%" hidden={!QROpen}>
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
            value={wallet.address}
          />
        </Flex>
      </Box>
      <Box p={2} width="100%">
        <Text.Body
          mt={3}
          opacity={0.5}
          fontWeight={600}
          style={{ textTransform: 'uppercase' }}
          animate={false}
        >
          {wallet.nickname}
        </Text.Body>
        <Text.Body opacity={0.9} fontWeight={600} fontSize={7} animate={false}>
          {amountDisplay}
        </Text.Body>
      </Box>
    </Flex>
  );
};

export const WalletInfo = observer(WalletInfoPresenter);
