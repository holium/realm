import { observer } from 'mobx-react';

import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { SoundActions } from 'renderer/lib/sound';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { StartRoomButtonView } from './StartRoomButtonView';

const StartRoomButtonPresenter = () => {
  const roomsStore = useRoomsStore();
  const { loggedInAccount } = useAppState();
  const { friends, chatStore } = useShipStore();
  const { selectedChat } = chatStore;

  const existingRoom = roomsStore.getRoomByPath(selectedChat?.path ?? '');
  const areWeInRoom = existingRoom?.present?.includes(
    loggedInAccount?.serverId ?? ''
  );

  const participants =
    existingRoom?.present.map((patp: string) => {
      return friends.getContactAvatarMetadata(patp);
    }) ?? [];

  const onClickRoom = async () => {
    if (!selectedChat) return;

    if (existingRoom) {
      if (areWeInRoom) {
        if (existingRoom?.present.length === 1) {
          // DELETE ROOM
          SoundActions.playRoomLeave();
          roomsStore.deleteRoom(existingRoom.rid);
        } else {
          // LEAVE ROOM
          SoundActions.playRoomLeave();
          roomsStore.leaveRoom(existingRoom.rid);
        }
      } else {
        // JOIN ROOM
        SoundActions.playRoomEnter();
        await roomsStore.joinRoom(existingRoom.rid);
      }
    } else {
      // CREATE ROOM
      SoundActions.playRoomEnter();
      await roomsStore?.createRoom(
        'standalone-room',
        'public',
        selectedChat.path
      );
    }
  };

  return (
    <StartRoomButtonView
      participants={participants}
      state={existingRoom ? (areWeInRoom ? 'leave' : 'join') : 'start'}
      onClick={onClickRoom}
    />
  );
};

export const StartRoomButton = observer(StartRoomButtonPresenter);
