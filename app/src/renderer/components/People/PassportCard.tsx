import { observer } from 'mobx-react';
import { rgba, darken } from 'polished';
import { Flex, Box, Text, Icons } from '../';
import { useTrayApps } from 'renderer/apps/store';
import { PassportButton } from './PassportButton';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { WalletView } from 'os/services/tray/wallet-lib/wallet.model';
import { useServices } from 'renderer/logic/store';
import { ShipActions } from 'renderer/logic/actions/ship';
import { openDMsToChat } from 'renderer/logic/lib/useTrayControls';
import { Avatar } from '@holium/design-system';

interface IPassport {
  patp: string;
  sigilColor?: string | null;
  avatar?: string | null;
  nickname?: string | null;
  description?: string | null;
  theme: {
    textColor: string;
    windowColor: string;
  };
  onClose: any;
}

const PassportCardPresenter = ({
  patp,
  sigilColor,
  avatar,
  nickname,
  description,
  theme,
  onClose,
}: IPassport) => {
  const { courier } = useServices();
  const { setActiveApp, dmApp, walletApp } = useTrayApps();

  const iconColor = rgba(theme.textColor, 0.7);
  const buttonColor = darken(0.1, theme.windowColor);

  return (
    <Flex flexDirection="column" gap={14}>
      <Flex flexDirection="row" gap={12} alignItems="center">
        <Box>
          <Avatar
            simple={false}
            size={52}
            avatar={avatar}
            patp={patp}
            sigilColor={[sigilColor || '#000000', 'white']}
            borderRadiusOverride="6px"
          />
        </Box>
        <Flex flexDirection="column" gap={4}>
          {nickname ? (
            <>
              <Text fontWeight={500} fontSize={3}>
                {nickname.substring(0, 30)} {nickname.length > 31 && '...'}
              </Text>
              <Text fontSize={2} opacity={0.6}>
                {patp}
              </Text>
            </>
          ) : (
            <Text fontWeight={500} fontSize={3}>
              {patp}
            </Text>
          )}
        </Flex>
      </Flex>
      <Flex gap={12} flexDirection="column">
        <Flex flexDirection="row" gap={4}>
          {walletApp.initialized && (
            <PassportButton
              style={{ backgroundColor: buttonColor }}
              data-prevent-menu-close="true"
              onClick={(evt: any) => {
                setActiveApp('wallet-tray', {
                  willOpen: true,
                  position: 'top-left',
                  anchorOffset: { x: 4, y: 26 },
                  dimensions: {
                    height: 580,
                    width: 330,
                  },
                });
                // TODO: placeholder, we need to implement the actual send coins functionality
                WalletActions.navigate(WalletView.TRANSACTION_SEND, {
                  walletIndex: '0',
                  to: patp,
                });
                onClose();
                evt.stopPropagation();
              }}
            >
              <Icons name="SendCoins" color={iconColor} size="16px" />
            </PassportButton>
          )}
          <PassportButton
            style={{ backgroundColor: buttonColor }}
            data-prevent-menu-close="true"
            onClick={(evt: any) => {
              // TODO replace with new DMs
              if (courier.previews.has(`/dm-inbox/${patp}`)) {
                const dmPreview = courier.previews.get(`/dm-inbox/${patp}`);
                if (dmPreview) openDMsToChat(dmApp, dmPreview, setActiveApp);
              } else {
                ShipActions.draftDm(
                  [patp],
                  [{ color: sigilColor, avatar, nickname }]
                ).then((dmDraft) => {
                  openDMsToChat(dmApp, dmDraft, setActiveApp);
                });
              }
              onClose();
              evt.stopPropagation();
            }}
          >
            <Icons name="StartDM" color={iconColor} size="16px" />
          </PassportButton>
        </Flex>
        {description && (
          <Flex flexDirection="column" gap={4}>
            <Text fontSize={2}>{description}</Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export const PassportCard = observer(PassportCardPresenter);
