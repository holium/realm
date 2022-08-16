import { FC, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text } from 'renderer/components';
import { rgba } from 'polished';
import { WalletHeader } from '../common/Header';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from 'renderer/logic/apps/store';
import { Wallet } from '../../lib/wallet';
import { constructSampleWallet } from '../../store';

interface EthListProps {}

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

export const EthList: FC<EthListProps> = observer((props: EthListProps) => {
  const { desktop } = useServices();
  const { walletApp } = useTrayApps();
  const onAddWallet = () => {};
  const list = walletApp.ethereum.list;
  useEffect(() => {
    constructSampleWallet().then((wallets) => {
      walletApp.setInitial('ethereum', wallets);
    });
  }, []);
  // return
  return (
    <Flex width="100%" flexDirection="column" alignItems="center">
      <WalletHeader
        theme={desktop.theme}
        network={walletApp.network}
        onAddWallet={onAddWallet}
        onSetNetwork={(network: any) => {
          walletApp.setNetwork(network);
        }}
      />
      <Flex flex={1} p={12} width="100%" flexDirection="column" gap={12}>
        {list.map((wallet) => {
          return (
            <Flex
              key={wallet.address}
              border="1px solid"
              borderColor={rgba('#000000', 0.1)}
              borderRadius={12}
              flexDirection="column"
              width="100%"
              pt={16}
              pb={16}
              pl={12}
              pr={12}
            >
              <Text
                opacity={0.5}
                fontWeight={600}
                style={{ textTransform: 'uppercase' }}
              >
                {wallet.name}
              </Text>
              <Text opacity={0.9} fontWeight={600} fontSize={7}>
                {wallet.balance} {abbrMap['ethereum']}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
});
