import { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { darken } from 'polished';

import {
  Avatar,
  Box,
  Flex,
  Icon,
  Spinner,
  Text,
} from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import { AppRegistry } from 'renderer/apps/registry';
import { useTrayApps } from 'renderer/apps/store';
import { calculateAnchorPointById } from 'renderer/lib/position';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { PassportButton } from './PassportButton';

interface IPassport {
  patp: string;
  color?: string | null;
  avatar?: string | null;
  nickname?: string | null;
  bio?: string | null;
  onClose: any;
}

const PassportCardPresenter = ({
  patp,
  color,
  avatar,
  nickname,
  bio,
  onClose,
}: IPassport) => {
  // const { setActiveApp, walletApp } = useTrayApps();
  const { loggedInAccount, theme } = useAppState();
  const { chatStore } = useShipStore();
  const { setChat, createChat } = chatStore;
  const [dmPath, setDMPath] = useState([]);
  const creating = useToggle(false);

  const { activeApp, setActiveApp, setTrayAppCoords, setTrayAppDimensions } =
    useTrayApps();

  const { icon, position, anchorOffset, dimensions } = AppRegistry['chat'];

  const our = loggedInAccount?.serverId;
  const getDMPath = async () => {
    if (!our) return;
    const _dmPath = await chatStore.findChatDM(patp, our);
    setDMPath(_dmPath);
    return _dmPath;
  };

  useEffect(() => {
    getDMPath();
  }, [patp]);

  const onChatClick = useCallback(() => {
    const { left, bottom }: any = calculateAnchorPointById(
      'messages-tray',
      anchorOffset,
      position,
      dimensions
    );
    setTrayAppCoords({
      left,
      bottom,
    });
    setTrayAppDimensions(dimensions);
    setActiveApp('messages-tray');
    onClose();
  }, [activeApp, setTrayAppCoords, setTrayAppDimensions, setActiveApp]);

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
            sigilColor={[color || '#000000', 'white']}
            borderRadiusOverride="6px"
          />
        </Box>
        <Flex flexDirection="column" gap={4}>
          {nickname ? (
            <>
              <Text.Custom fontWeight={500} fontSize={3}>
                {nickname.substring(0, 30)} {nickname.length > 31 && '...'}
              </Text.Custom>
              <Text.Custom fontSize={2} opacity={0.6}>
                {patp}
              </Text.Custom>
            </>
          ) : (
            <Text.Custom fontWeight={500} fontSize={3}>
              {patp}
            </Text.Custom>
          )}
        </Flex>
      </Flex>
      <Flex gap={12} flexDirection="column">
        <Flex flexDirection="row" gap={4}>
          {/* {walletApp.initialized && (
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
                // WalletActions.navigate(WalletScreen.TRANSACTION_SEND, {
                //   walletIndex: '0',
                //   to: patp,
                // });
                onClose();
                evt.stopPropagation();
              }}
            >
              <Icon name="SendCoins" size={16} opacity={0.7} />
            </PassportButton>
          )} */}
          {/* TODO re-enable */}
          <PassportButton
            style={{ backgroundColor: buttonColor }}
            data-prevent-menu-close="true"
            onClick={(evt: any) => {
              if (dmPath.length > 0) {
                // @ts-expect-error
                const path = dmPath[0].path;
                setChat(path);
                onChatClick();
              } else {
                // TODO: create chat and then navigate there
                const title = nickname || patp;
                if (!our) return;
                creating.toggleOn();
                createChat(title, our, 'dm', [patp])
                  .then(() => {
                    getDMPath().then((_dmPath) => {
                      if (_dmPath.length > 0) {
                        const path = _dmPath[0].path;
                        setChat(path);
                        onChatClick();
                      }
                      creating.toggleOff();
                    });
                  })
                  .catch((err) => {
                    creating.toggleOff();
                    console.log(err);
                  });
              }
              evt.stopPropagation();
            }}
          >
            {creating.isOn ? (
              <Spinner size={0} />
            ) : (
              <Icon name={icon} size="16px" />
            )}
          </PassportButton>
        </Flex>
        {bio && (
          <Flex flexDirection="column" gap={4}>
            <Text.Custom fontSize={2}>{bio}</Text.Custom>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export const PassportCard = observer(PassportCardPresenter);
