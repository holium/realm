import { motion } from 'framer-motion';

import { Flex, Text } from '@holium/design-system/general';

import { ERC20Type } from 'renderer/stores/models/wallet.model';

import { getMockCoinIcon } from '../../helpers';
import { walletCardStyleTransition } from '../WalletCardWrapper';

type Props = {
  address: string;
  coin: ERC20Type | null;
  amountDisplay: string;
  amountUsdDisplay: string;
};

export const Balance = ({
  address,
  coin,
  amountDisplay,
  amountUsdDisplay,
}: Props) => {
  const coinIcon = coin ? coin.logo || getMockCoinIcon(coin.name) : '';

  if (coin) {
    return (
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
          {amountDisplay}
        </Text.Body>
        <Text.Body
          mt={1}
          layout="position"
          layoutId={`wallet-coin-usd`}
          variant="body"
        >
          {amountUsdDisplay}
        </Text.Body>
      </Flex>
    );
  }

  return (
    <>
      <Text.Body
        mt={1}
        layout="position"
        transition={walletCardStyleTransition}
        layoutId={`wallet-balance-${address}`}
        fontWeight={600}
        fontSize={7}
      >
        {amountDisplay}
      </Text.Body>
      <Text.Body
        mt={1}
        layout="position"
        layoutId={`wallet-usd-${address}`}
        transition={walletCardStyleTransition}
        variant="body"
      >
        {amountUsdDisplay}
      </Text.Body>
    </>
  );
};
