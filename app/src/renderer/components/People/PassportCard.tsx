import { FC } from 'react';
import { rgba, darken } from 'polished';
import { Sigil, Flex, Box, Text, Icons, Select } from '../';
import { useTrayApps } from 'renderer/apps/store';
import { PassportButton } from './PassportButton';
import { WalletActions } from 'renderer/logic/actions/wallet';
import { WalletView } from 'os/services/tray/wallet-lib/wallet.model';
import { useServices } from 'renderer/logic/store';
import { ShipActions } from 'renderer/logic/actions/ship';
import { openDMsToChat } from 'renderer/logic/lib/useTrayControls';

interface IPassport {
  patp: string;
  role?: string;
  sigilColor?: string | null;
  avatar?: string | null;
  nickname?: string | null;
  description?: string | null;
  theme?: {
    textColor: string;
    windowColor: string;
  };
  onClose: any;
}

export const PassportCard: FC<IPassport> = (props: IPassport) => {
  const { patp, role, sigilColor, avatar, nickname, description, onClose } = props;
  const { textColor, windowColor } = props.theme!;
  const { courier } = useServices();
  const { setActiveApp, dmApp, walletApp } = useTrayApps();

  console.log('role', role)

  const iconColor = rgba(textColor, 0.7);
  const buttonColor = darken(0.1, windowColor);
  return (
    <Flex flexDirection="column" gap={14}>
      <Flex flexDirection="row" gap={12} alignItems="center">
        <Box>
          <Sigil
            simple={false}
            size={52}
            avatar={avatar}
            patp={patp}
            color={[sigilColor || '#000000', 'white']}
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
          <Select
            id="select-role"
            placeholder="Select role"
            customBg={windowColor}
            textColor={textColor}
            iconColor={iconColor}
            selected={role}
            // disabled={isOur}
            options={[
              { label: 'Initiate', value: 'initiate' },
              { label: 'Member', value: 'member' },
              { label: 'Admin', value: 'admin' },
              // { label: 'Host', value: 'host' }, TODO elect a data host
              { label: 'Owner', value: 'owner', hidden: true },
            ]}
            onClick={(selected: Roles) => {
              /*setPermissionMap({
                ...permissionMap,
                [patp]: {
                  primaryRole: selected,
                  roles: [selected],
                  alias: '',
                  status: 'invited',
                },
              });*/
            }}
          />
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
              if (courier.previews.has(`/dm-inbox/${patp}`)) {
                const dmPreview = courier.previews.get(`/dm-inbox/${patp}`)!;
                openDMsToChat(dmApp, dmPreview, setActiveApp);
              } else {
                ShipActions.draftDm(
                  [patp],
                  [{ color: sigilColor, avatar, nickname }]
                ).then((dmDraft) => {
                  openDMsToChat(dmApp, dmDraft!, setActiveApp);
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
