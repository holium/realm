import { observer } from 'mobx-react';

import { Button, Flex, Icon, Text, Tooltip } from '@holium/design-system';

import { RoomMobx } from 'renderer/stores/rooms.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { useTrayApps } from '../store';
import { ProviderSelector } from './components/ProviderSelector';
import { RoomRow } from './components/RoomRow';
import { useEffect } from 'react';
import { trackEvent } from 'renderer/lib/track';

const RoomsPresenter = () => {
  const { spacesStore, roomsStore } = useShipStore();
  const { roomsApp } = useTrayApps();

  const ourSpace = spacesStore.selected?.type === 'our';

  useEffect(() => {
    trackEvent('OPENED', 'ROOMS_LIST');
  }, []);

  const rooms = ourSpace
    ? roomsStore?.roomsList
    : roomsStore.getSpaceRooms(spacesStore.selected?.path ?? '');

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
        {rooms?.map((room: RoomMobx, index: number) => {
          return (
            <RoomRow
              key={`${room.title}-${index}`}
              rid={room.rid}
              title={room.title}
              provider={room.provider}
              present={room.present}
              // cursors={room.cursors}
              creator={room.creator}
              access={room.access}
              capacity={room.capacity}
              onClick={async (evt: any) => {
                evt.stopPropagation();
                if (roomsStore.current?.rid !== room.rid) {
                  roomsStore?.joinRoom(room.rid);
                }
                roomsApp.setView('room');
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
