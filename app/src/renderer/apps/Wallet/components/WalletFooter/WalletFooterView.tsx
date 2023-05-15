import styled from 'styled-components';

import { Box, Button, Flex, Icon } from '@holium/design-system/general';

import { ProtocolType } from 'os/services/ship/wallet/wallet.types';

import { WalletProtocol } from '../WalletProtocol';

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
  protocol: ProtocolType;
  hidden?: boolean;
  onClickSettings: () => void;
};

export const WalletFooterView = ({
  protocol,
  hidden = false,
  onClickSettings,
}: Props) => (
  <Wrapper hidden={hidden}>
    <Flex justifyContent="space-between">
      <WalletProtocol protocol={protocol} />
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
        <Button.IconButton size={24} onClick={onClickSettings}>
          <Icon name="Settings" size={20} opacity={0.5} />
        </Button.IconButton>
      </Flex>
    </Flex>
  </Wrapper>
);
