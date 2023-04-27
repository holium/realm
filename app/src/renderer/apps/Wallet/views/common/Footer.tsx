import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Box, Button, Flex, Icon } from '@holium/design-system';

import { WalletView } from 'renderer/stores/models/wallet.model';
import { useShipStore } from 'renderer/stores/ship.store';

import { WalletNetwork } from './Network';

const Wrapper = styled(Box)`
  position: absolute;
  z-index: 3;
  bottom: -12px;
  left: -12px;
  right: -12px;
  padding: 12px;
  height: 50px;
  width: calc(100% + 24px);
  display: ${({ hidden }) => (hidden ? 'none' : 'block')};
`;

type Props = {
  hidden?: boolean;
};

export const WalletFooterPresenter = ({ hidden = false }: Props) => {
  const { walletStore } = useShipStore();

  return (
    <Wrapper hidden={hidden}>
      <Flex justifyContent="space-between">
        <WalletNetwork network={walletStore.navState.protocol} />
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
          <Button.IconButton
            size={24}
            onClick={() => walletStore.navigate(WalletView.SETTINGS)}
          >
            <Icon name="Settings" size={20} opacity={0.5} />
          </Button.IconButton>
        </Flex>
      </Flex>
    </Wrapper>
  );
};

export const WalletFooter = observer(WalletFooterPresenter);
