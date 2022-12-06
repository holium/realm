import { observer } from 'mobx-react';
import { FC } from 'react';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { Box, Flex, IconButton, Icons } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { WalletNetwork } from './Network';
import { WalletView } from '@holium/realm-wallet/src/wallet.model';
import { useTrayApps } from 'renderer/apps/store';

interface WalletFooterProps {
  hidden: boolean;
}

export const WalletFooter: FC<WalletFooterProps> = observer(
  (props: WalletFooterProps) => {
    const { walletApp } = useTrayApps();
    const { theme } = useServices();

    return (
      <Box width="100%" hidden={props.hidden}>
        <Flex
          position="absolute"
          bottom={0}
          px="12px"
          pb="12px"
          width="100%"
          justifyContent="space-between"
        >
          <Box mr={1}>
            <WalletNetwork
              network={walletApp.navState.protocol}
            />
          </Box>
          <IconButton
            onClick={async () =>
              await WalletActions.navigate(WalletView.SETTINGS)
            }
          >
            <Icons name="Settings" size={2} />
          </IconButton>
        </Flex>
      </Box>
    );
  }
);

export default WalletFooter;
