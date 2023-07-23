import { useEffect } from 'react';
import { observer } from 'mobx-react';

import {
  Button,
  Flex,
  Icon,
  Text,
  Tooltip,
} from '@holium/design-system/general';

import { useSound } from 'renderer/lib/sound';
import { trackEvent } from 'renderer/lib/track';
import { useShipStore } from 'renderer/stores/ship.store';

import { useTrayApps } from '../store';
import { ProviderSelector } from './components/ProviderSelector';
import { RoomRow } from './components/RoomRow';
import { roomTrayConfig } from './config';
import { RoomModel } from './store/RoomsStore';
import { useRoomsStore } from './store/RoomsStoreContext';

const RoomsPresenter = () => {
  const { spacesStore } = useShipStore();
  const { roomsApp, dimensions, setTrayAppHeight } = useTrayApps();
  const roomsStore = useRoomsStore();

  const sound = useSound();

  useEffect(() => {
    trackEvent('OPENED', 'ROOMS_LIST');
    if (dimensions.height !== roomTrayConfig.dimensions.height) {
      setTrayAppHeight(roomTrayConfig.dimensions.height);
    }
  }, []);

  const rooms = roomsStore.getSpaceRooms(spacesStore.selected?.path ?? '');

  return (
    <>
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Flex justifyContent="center" alignItems="center">
          <Icon opacity={0.8} name="Connect" size={24} mr={3} />
          <Text.Custom fontWeight={600} textTransform="uppercase" opacity={0.7}>
            Rooms
          </Text.Custom>
        </Flex>
        <Button.TextButton
          showOnHover
          height={26}
          fontWeight={500}
          onClick={(evt: any) => {
            evt.stopPropagation();
            roomsApp.setView('new-room');
          }}
        >
          Create
        </Button.TextButton>
      </Flex>
      <Flex gap={8} flex={1} flexDirection="column" overflowY={'auto'}>
        {rooms?.length === 0 && (
          <Flex
            flex={1}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            mb={46}
            gap={8}
          >
            <Text.Custom fontWeight={500} opacity={0.5}>
              No rooms
            </Text.Custom>
            <Text.Custom width="90%" textAlign="center" opacity={0.3}>
              A room enables collaboration with other people.
            </Text.Custom>
          </Flex>
        )}
        {rooms?.map((room: RoomModel, index: number) => {
          return (
            <RoomRow
              key={`${room.title}-${index}`}
              rid={room.rid}
              title={room.title}
              provider={room.provider}
              present={room.present}
              creator={room.creator}
              access={room.access}
              capacity={room.capacity}
              onClick={async (evt: any) => {
                evt.stopPropagation();
                if (roomsStore.currentRid !== room.rid) {
                  sound.playRoomEnter();
                  try {
                    await roomsStore.joinRoom(room.rid);
                    roomsApp.setView('room');
                  } catch (e) {
                    // TODO put error in UI
                    console.error(e);
                  }
                } else {
                  roomsApp.setView('room');
                }
              }}
            />
          );
        })}
      </Flex>
      <Flex mt={3} justifyContent="space-between">
        <Tooltip
          id="room-provider"
          placement="top"
          content="This is your room provider."
        >
          <ProviderSelector
            onClick={() => {
              console.log('show provider setup');
            }}
          />
        </Tooltip>
        <Button.IconButton
          width={26}
          height={26}
          onClick={(evt: any) => {
            evt.stopPropagation();
            roomsApp.setView('settings');
          }}
        >
          <Icon name="AudioControls" size={18} opacity={0.7} />
        </Button.IconButton>
      </Flex>
    </>
  );
};

export const Rooms = observer(RoomsPresenter);
