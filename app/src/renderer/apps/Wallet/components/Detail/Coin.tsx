import { useEffect, useState } from 'react';

import { Flex, Icon, Row, Text } from '@holium/design-system/general';

import { ERC20Type } from 'renderer/stores/models/wallet.model';

import {
  convertERC20AmountToUsd,
  formatCoinAmount,
  getMockCoinIcon,
} from '../../helpers';

type Props = {
  coin: ERC20Type;
  onClickCoin: (address: string) => void;
};

export const Coin = ({ coin, onClickCoin }: Props) => {
  // const [coinPrice, setCoinPrice] = useState<number>();
  const [amountUsdDisplay, setAmountUsdDisplay] = useState<string>('');

  useEffect(() => {
    const coinName = coin.name.replace(/\s/g, '');
    coin.conversions.getUsdPrice(coinName).then((coinInUsd) => {
      if (!coinInUsd) {
        setAmountUsdDisplay('Error fetching price');
      } else {
        setAmountUsdDisplay(
          `$${convertERC20AmountToUsd(
            formatCoinAmount(coin.balance, coin.decimals),
            coinInUsd / parseFloat(coin.balance)
          )} USD`
        );
      }
    });
  }, [coin]);

  const coinIcon = coin.logo || getMockCoinIcon(coin.name);
  const amount = formatCoinAmount(coin.balance, coin.decimals);

  return (
    <Row onClick={() => onClickCoin(coin.address)}>
      <Flex width="100%" alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <img
            alt="Coin"
            style={{ marginRight: '12px' }}
            width="20px"
            height="20px"
            src={coinIcon}
          />
          <Flex flexDirection="column" justifyContent="center">
            <Text.Body>
              {amount.display} {coin.name}
            </Text.Body>
            <Text.Body style={{ fontSize: '11px' }} opacity={0.5}>
              {amountUsdDisplay}
            </Text.Body>
          </Flex>
        </Flex>
        <Icon name="ChevronRight" height={20} />
      </Flex>
    </Row>
  );
};
