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
import { SpacesActions } from 'renderer/logic/actions/spaces';

type Roles = 'initiate' | 'member' | 'admin' | 'owner';

interface IPassport {
  patp: string;
  roles?: string[];
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
  const { patp, roles, sigilColor, avatar, nickname, description, onClose } =
    props;
  const { textColor, windowColor } = props.theme!;
  const { courier, membership, spaces, ship } = useServices();
  const { setActiveApp, dmApp, walletApp } = useTrayApps();

  const ourRoles = membership.spaces
    .get(spaces.selected!.path)!
    .get(ship!.patp)!.roles;

  const iconColor = rgba(textColor, 0.7);
  const buttonColor = darken(0.1, windowColor);

  let activeRole = 'initiate';
  if (roles) {
    if (roles.includes('admin')) activeRole = 'admin';
    else if (roles.includes('member')) activeRole = 'member';
    else if (roles.includes('initiate')) {
      activeRole = 'initiate';
    }
  }
  const setNewRole = (role: Roles) => {
    const newRoles = roles
      ? [...roles.filter((role) => role !== activeRole), role]
      : [role];
    console.log('old', roles);
    console.log('new', newRoles);
    SpacesActions.setRoles(patp, newRoles);
  };
  const isAdmin = roles!.includes('admin');
  const isOwner = roles!.includes('owner');
  const ourAdmin = ourRoles.includes('admin');
  const ourOwner = ourRoles.includes('owner');
  const allowRoleChange = (ourOwner || (ourAdmin && !isAdmin)) && !isOwner;

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
          {allowRoleChange ? (
            <Select
              id="select-role"
              placeholder="Select role"
              customBg={windowColor}
              textColor={textColor}
              iconColor={iconColor}
              selected={activeRole}
              // disabled={isOur}
              options={[
                { label: 'Initiate', value: 'initiate' },
                { label: 'Member', value: 'member' },
                { label: 'Admin', value: 'admin' },
                // { label: 'Host', value: 'host' }, TODO elect a data host
                { label: 'Owner', value: 'owner', hidden: true },
              ]}
              onClick={(selected: Roles) => {
                setNewRole(selected);
              }}
            />
          ) : (
            <Flex />
          )}
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
