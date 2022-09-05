import { FC, useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text } from 'renderer/components';
import { rgba } from 'polished';
import { WalletHeader } from '../common/Header';
import { useServices } from 'renderer/logic/store';
import { useTrayApps } from 'renderer/logic/apps/store';
import { Wallet } from '../../lib/wallet';
import { constructSampleWallet } from '../../store';
import { WalletCard } from '../common/WalletCard';
import { AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { RealmEthWalletAgent } from 'js/src/realm-wallet-eth';
import { WalletActions } from '../../../../logic/actions/wallet';

interface EthListProps {}

const abbrMap = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
};

export const EthList: FC<EthListProps> = observer((props: EthListProps) => {
  const [selected, setSelected] = useState<any>(null);
  const containerRefs = useRef(new Array());
  const { walletApp } = useTrayApps();
  const onAddWallet = () => {};
  const list = walletApp.ethereum.list;
  useEffect(() => {
    // constructSampleWallet().then(wallets => console.log(wallets));
    WalletActions.setXpub();
  })
  // return
  return (
    <Flex width="100%" flexDirection="column" alignItems="center">
      <Flex flex={1} p={12} width="100%" flexDirection="column" gap={12}>
        <AnimateSharedLayout>
          <AnimatePresence>
            {selected && <Flex>{selected.address}</Flex>}
          </AnimatePresence>
          {list.map((wallet) => {
            return (
              <WalletCard
                ref={(el: any) => (containerRefs.current[wallet.address] = el)}
                key={wallet.address}
                wallet={wallet}
                onSelect={() => {
                  console.log('selected');
                  setSelected(wallet);
                }}
              />
            );
          })}
        </AnimateSharedLayout>
      </Flex>
    </Flex>
  );
});
