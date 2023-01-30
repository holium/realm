import { observer } from 'mobx-react';
import { FC, useEffect, useState } from 'react';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { Box, Flex, IconButton, Icons } from 'renderer/components';
import { useServices } from 'renderer/logic/store';
import { WalletNetwork } from './Network';
import { WalletView } from 'os/services/tray/wallet-lib/wallet.model';
import { useTrayApps } from 'renderer/apps/store';
interface WalletFooterProps {
  hidden: boolean;
}

export const WalletFooter: FC<WalletFooterProps> = observer(
  (props: WalletFooterProps) => {
    const { walletApp } = useTrayApps();
    const { theme } = useServices();

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
      <Box
        position="absolute"
        z-index={3}
        bottom={0}
        px="12px"
        pb="12px"
        pt="12px"
        width="100%"
        hidden={props.hidden}
      >
        <Flex
          justifyContent="space-between"
          style={{ backgroundColor: theme.currentTheme.windowColor }}
        >
          <Box mr={1}>
            <WalletNetwork network={walletApp.navState.protocol} />
          </Box>
          <Flex>
            <Flex mr="10px">
              {/*walletApp.navState.network === NetworkType.ETHEREUM &&
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
                ))*/}
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
