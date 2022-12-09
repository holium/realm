import { observer } from 'mobx-react';
import { FC, useState } from 'react';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { Box, Flex, IconButton, Icons } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { WalletNetwork } from './Network';
import { NetworkType, ProtocolType, WalletView } from '@holium/realm-wallet/src/wallet.model';
import { useTrayApps } from 'renderer/apps/store';
import { ImageToggle } from 'renderer/components/Toggle';
// @ts-expect-error its there...
import UqbarLogo from '../../../../../../assets/uqbar.png';

interface WalletFooterProps {
  hidden: boolean;
}

export const WalletFooter: FC<WalletFooterProps> = observer(
  (props: WalletFooterProps) => {
    const { walletApp } = useTrayApps();
    const { theme } = useServices();

    const [click, setClick] = useState(false);
    const toggleUqbar = () => {
      if (click) {
        WalletActions.toggleUqbar();
      }
      setClick(!click)
    }

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
          <Flex>
            <Flex mr='10px' onClick={toggleUqbar}>
              {walletApp.navState.network === NetworkType.ETHEREUM
              && <ImageToggle src={UqbarLogo} checked={walletApp.navState.protocol === ProtocolType.UQBAR}/>}
            </Flex>
            <IconButton
              onClick={async () =>
                await WalletActions.navigate(WalletView.SETTINGS)
              }
            >
              <Icons name="Settings" size={2} />
            </IconButton>
          </Flex>
        </Flex>
      </Box>
    );
  }
);

export default WalletFooter;
