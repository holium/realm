import { Flex, Text } from '@holium/design-system/general';

import { ERC20Type } from 'renderer/stores/models/wallet.model';

import { getMockCoinIcon } from '../../helpers';

type Props = {
  coin: ERC20Type | null;
  amountDisplay: string;
  amountUsdDisplay: string;
};

export const WalletBalance = ({
  coin,
  amountDisplay,
  amountUsdDisplay,
}: Props) => (
  <Flex flexDirection="column" alignItems="center" gap="7px">
    {coin && (
      <img
        alt="coin icon"
        width="26px"
        height="26px"
        src={coin.logo ?? getMockCoinIcon(coin.name)}
        style={{ objectFit: 'cover' }}
      />
    )}
    <Text.Body opacity={0.8} fontWeight={600} fontSize={5}>
      {amountDisplay}
    </Text.Body>
    <Text.Body opacity={0.5}>{amountUsdDisplay}</Text.Body>
  </Flex>
);
