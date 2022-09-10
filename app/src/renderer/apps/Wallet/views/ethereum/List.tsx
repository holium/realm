import { FC, useRef } from 'react';
import { observer } from 'mobx-react';
import { Flex, Text, Button } from 'renderer/components';
import { useTrayApps } from 'renderer/apps/store';
import { WalletCard } from '../common/WalletCard';
import { WalletView } from '../../store';
import { NetworkType } from 'os/services/tray/wallet.model';

interface WalletListProps {
  network: NetworkType
}

export const WalletList: FC<WalletListProps> = observer((props: WalletListProps) => {
  console.log(props.network)
  console.log(props.network === NetworkType.ethereum)
  const containerRefs = useRef(new Array());
  const { walletApp } = useTrayApps();
  const list = walletApp.ethereum.list;

  const List: FC = (props: any) => {
    return (
      <Flex>
        {list.map((wallet) => {
          return (
            <WalletCard
              ref={(el: any) => (containerRefs.current[wallet.address as string] = el)}
              key={wallet.address}
              wallet={wallet}
              onSelect={() => {
                console.log('selected');
                walletApp.setView(WalletView.ETH_DETAIL, wallet.address);
              }}
            />
          );
        })}
      </Flex>
    );
  };

  const Empty: FC<any> = (props: any) => {
    let onClick = () => {
      // set view
      console.log('set the viewwww');
    }

    return (
      <Flex width="100%" height="100%" flexDirection="column" justifyContent="center" alignItems="center">
        <Text variant="h3" textAlign="center">No wallets</Text>
        <Flex width="80%" justifyContent="center">
          <Text mt={4} variant="body" textAlign="center">
            You haven't created any {props.network === NetworkType.ethereum ? 'ethereum' : 'bitcoin'} wallets yet.
          </Text>
        </Flex>
        <Flex mt={9} justifyContent="center">
          <Button onClick={onClick}>Create wallet</Button>
        </Flex>
      </Flex>
    )
  };

  return (
    <Flex p={4} height="100%" width="100%" flexDirection="column" alignItems="center" justifyContent="center">
        { list.length
          ? <List />
          : <Empty network={props.network} />
        }
    </Flex>
  );
});
