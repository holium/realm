import { useEffect } from 'react';
import { observer } from 'mobx-react';

import {
  Button,
  CommButton,
  Flex,
  Icon,
  Text,
} from '@holium/design-system/general';

import { trackEvent } from 'renderer/lib/track';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { VoiceView } from '../Rooms/Room/Voice';
import { useRoomsStore } from '../Rooms/store/RoomsStoreContext';

const StandaloneChatRoomPresenter = () => {
  const { loggedInAccount } = useAppState();
  const roomsStore = useRoomsStore();
  const { chatStore } = useShipStore();

  const isMuted = roomsStore.ourPeer.isMuted;
  const hasVideo = roomsStore.ourPeer.isVideoOn;
  const isScreenSharing = roomsStore.ourPeer.isScreenSharing;

  useEffect(() => {
    trackEvent('OPENED', 'ROOMS_VOICE');
  }, []);

  const presentRoom = roomsStore.getRoomByPath(
    chatStore.selectedChat?.path ?? ''
  );

  if (!presentRoom) return <div />;

  const { rid, creator, present, title } = presentRoom;
  const presentCount = present?.length ?? 0;
  const creatorStr =
    creator.length > 14 ? `${creator.substring(0, 14)}...` : creator;

  return (
    <Flex flex={1} flexDirection="column" width="100%">
      <Flex
        alignItems="center"
        height="58px"
        gap={10}
        padding="0 12px"
        background="var(--rlm-window-color)"
        borderBottom="1px solid var(--rlm-base-color)"
      >
        <Button.IconButton
          size={26}
          onClick={() => chatStore.setSubroute('chat')}
        >
          <Icon name="ArrowLeftLine" size={22} opacity={0.7} />
        </Button.IconButton>
        <Flex flexDirection="column">
          <Text.Custom
            fontSize={3}
            fontWeight={600}
            opacity={0.8}
            style={{
              wordWrap: 'normal',
              textOverflow: 'ellipsis',
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Text.Custom>
          <Flex mt="2px">
            <Text.Custom fontSize={2} fontWeight={400} opacity={0.5}>
              {creatorStr}
            </Text.Custom>
            <Text.Custom mx="6px" fontSize={2} fontWeight={400} opacity={0.5}>
              •
            </Text.Custom>
            <Text.Custom fontSize={2} fontWeight={400} opacity={0.5}>
              {`${presentCount} ${presentCount === 1 ? 'person' : 'people'}`}
            </Text.Custom>
          </Flex>
        </Flex>
      </Flex>
      <Flex flex={1} flexDirection="column">
        <Flex flex={1}>
          <VoiceView isStandaloneChat />
        </Flex>
        <Flex
          width="100%"
          height="65px"
          zIndex={5}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          background="var(--rlm-window-color)"
          borderTop="1px solid var(--rlm-base-color)"
          px={1}
          pb={1}
        >
          <Flex gap={12} flex={1} justifyContent="center" alignItems="center">
            <CommButton
              icon="RoomLeave"
              size={22}
              customBg="intent-alert"
              onClick={(evt) => {
                evt.stopPropagation();
                if (creator === loggedInAccount?.serverId) {
                  roomsStore.deleteRoom(rid);
                  chatStore.setSubroute('chat');
                } else {
                  roomsStore.leaveRoom(rid);
                  chatStore.setSubroute('chat');
                }
              }}
            />
            <CommButton
              icon={isMuted ? 'MicOff' : 'MicOn'}
              onClick={(evt) => {
                evt.stopPropagation();
                if (isMuted) {
                  roomsStore.ourPeer.unmute();
                } else {
                  roomsStore.ourPeer.mute();
                }
              }}
            />
            <CommButton
              icon={hasVideo ? 'VideoOn' : 'VideoOff'}
              onClick={() => {
                roomsStore.toggleVideo(!hasVideo);
              }}
            />
            <CommButton
              icon={'ScreenSharing'}
              onClick={() => {
                roomsStore.toggleScreenShare(!isScreenSharing);
              }}
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export const StandaloneChatRoom = observer(StandaloneChatRoomPresenter);
