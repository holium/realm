import { observer } from 'mobx-react';
import { FC, useEffect, useState } from 'react';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { Box, Flex, IconButton, Icons, Tooltip } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { WalletNetwork } from './Network';
import {
  NetworkType,
  ProtocolType,
  WalletView,
} from 'os/services/tray/wallet-lib/wallet.model';
import { useTrayApps } from 'renderer/apps/store';
import { ImageToggle } from 'renderer/components/Toggle';
// @ts-expect-error its there...
import UqbarLogo from '../../../../../../assets/uqbar.png';
import { getBaseTheme } from '../../lib/helpers';
import { darken } from 'polished';

interface WalletFooterProps {
  hidden: boolean;
}

export const WalletFooter: FC<WalletFooterProps> = observer(
  (props: WalletFooterProps) => {
    const { walletApp } = useTrayApps();
    const { theme } = useServices();
    const themeData = getBaseTheme(theme.currentTheme);

    const [click, setClick] = useState(false);
    const [uqbarDeskExists, setUqbarDeskExists] = useState(false);
    const toggleUqbar = () => {
      if (click) {
        WalletActions.toggleUqbar();
      }
      setClick(!click);
    };

    useEffect(() => {
      WalletActions.uqbarDeskExists().then((exists) => {
        setUqbarDeskExists(exists);
      });
    }, []);

    return (
      <Box width="100%" hidden={props.hidden}>
        <Flex
          bottom={0}
          px="12px"
          pb="12px"
          pt="6px"
          width="100%"
          justifyContent="space-between"
          style={{ backgroundColor: theme.currentTheme.windowColor }}
        >
          <Box mr={1}>
            <WalletNetwork network={walletApp.navState.protocol} />
          </Box>
          <Flex>
            <Flex mr="10px">
              {walletApp.navState.network === NetworkType.ETHEREUM &&
                (uqbarDeskExists ? (
                  <ImageToggle
                    src={UqbarLogo}
                    color={darken(0.03, theme.currentTheme.windowColor)}
                    checked={walletApp.navState.protocol === ProtocolType.UQBAR}
                    disabled={false}
                    onClick={toggleUqbar}
                  />
                ) : (
                  <Tooltip
                    id="uqbar-tray-toggle-tooltip"
                    content="Install %zig desk to use Uqbar"
                    placement="top"
                    show
                  >
                    <ImageToggle
                      src={UqbarLogo}
                      color={darken(0.03, theme.currentTheme.windowColor)}
                      checked={false}
                      disabled={true}
                      onClick={() => {}}
                    />
                  </Tooltip>
                ))}
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
