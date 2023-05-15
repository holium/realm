import { observer } from 'mobx-react';

import { Flex, Icon, Row, Text } from '@holium/design-system/general';

import { WalletScreen } from 'renderer/apps/Wallet/types';
import { ERC20Type } from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { formatCoinAmount, getMockCoinIcon } from '../../helpers';

type Props = { details: ERC20Type };

const CoinPresenter = ({ details }: Props) => {
  const { walletStore } = useShipStore();
  const coinIcon = details.logo || getMockCoinIcon(details.name);
  const amount = formatCoinAmount(details.balance, details.decimals);

  return (
    <Row
      onClick={() => {
        walletStore.navigate(WalletScreen.WALLET_DETAIL, {
          detail: {
            type: 'coin',
            txtype: 'coin',
            coinKey: details.address,
            key: details.address,
          },
        });
      }}
    >
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
              {amount.display} {details.name}{' '}
            </Text.Body>
          </Flex>
        </Flex>
        <Icon name="ChevronRight" height={20} />
      </Flex>
    </Row>
  );
};

export const Coin = observer(CoinPresenter);
