import { observer } from 'mobx-react';
import { FC } from 'react';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { Box, Flex, Icons } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { getBaseTheme } from '../../lib/helpers';
import { WalletNetwork } from './Network';
import { WalletView } from 'os/services/tray/wallet.model';
import { useTrayApps } from 'renderer/apps/store';

interface WalletFooterProps {
  hidden: boolean;
}

export const WalletFooter: FC<WalletFooterProps> = observer(
  (props: WalletFooterProps) => {
    const { walletApp } = useTrayApps();
    const { theme } = useServices();
    const themeData = getBaseTheme(theme.currentTheme);

    let settingsView = WalletView.SETTINGS;

    return (
      <Box width="100%" hidden={props.hidden}>
        <Flex
          position="absolute"
          bottom={0}
          pr="12px"
          pb="12px"
          width="100%"
          justifyContent="flex-end"
        >
          <Box mr={1}>
            <WalletNetwork
              network={
                walletApp.ethereum.network === 'mainnet'
                  ? 'Ethereum Mainnet'
                  : 'Görli Testnet'
              }
            />
          </Box>
          <Box
            onClick={() =>
              WalletActions.setView(
                settingsView,
                walletApp.currentIndex,
                walletApp.currentItem
              )
            }
          >
            <Icons name="Settings" color={theme.currentTheme.iconColor} />
          </Box>
        </Flex>
      </Box>
    );
  }
);

export default WalletFooter;
