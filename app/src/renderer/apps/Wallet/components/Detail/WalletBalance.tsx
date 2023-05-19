import { Flex, Text } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import { ERC20Type } from 'renderer/stores/models/wallet.model';

import { getMockCoinIcon } from '../../helpers';

type Props = {
  coin: ERC20Type | null;
  amountDisplay: string;
  amountUsdDisplay: string;
  simple?: boolean;
};

export const WalletBalance = ({
  coin,
  amountDisplay,
  amountUsdDisplay,
  simple,
}: Props) => {
  const hideImg = useToggle(false);

  if (simple) {
    return (
      <Text.Body
        opacity={0.8}
        fontWeight={600}
        style={{ fontSize: '28px', lineHeight: '14px' }}
      >
        {amountDisplay}
      </Text.Body>
    );
  }

  return (
    <Flex flexDirection="column" alignItems="center" gap="7px">
      {coin && !hideImg.isOn && (
        <img
          alt="coin icon"
          width="26px"
          height="26px"
          src={coin.logo ?? getMockCoinIcon(coin.name)}
          style={{ objectFit: 'cover' }}
          onError={() => hideImg.toggleOn()}
        />
      )}
      <Text.Body opacity={0.8} fontWeight={600} fontSize={5}>
        {amountDisplay}
      </Text.Body>
      <Text.Body opacity={0.5}>~ {amountUsdDisplay}</Text.Body>
    </Flex>
  );
};
