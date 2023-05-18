import { Flex, Icon, Row, Text } from '@holium/design-system/general';

import { ERC20Type } from 'renderer/stores/models/wallet.model';

import { formatCoinAmount, getMockCoinIcon } from '../../helpers';

type Props = {
  coin: ERC20Type;
  onClickCoin: (address: string) => void;
};

export const Coin = ({ coin, onClickCoin }: Props) => {
  const coinIcon = coin.logo || getMockCoinIcon(coin.name);
  const amount = formatCoinAmount(coin.balance, coin.decimals);

  return (
    <Row onClick={() => onClickCoin(coin.address)}>
      <Flex width="100%" alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <img
            alt="Coin"
            style={{ marginRight: '12px' }}
            height="20px"
            width="20px"
            src={coinIcon}
          />
          <Flex flexDirection="column" justifyContent="center">
            <Text.Body variant="body">
              {' '}
              {amount.display} {coin.name}{' '}
            </Text.Body>
          </Flex>
        </Flex>
        <Icon name="ChevronRight" height={20} />
      </Flex>
    </Row>
  );
};
