import { observer } from 'mobx-react';

import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { useSound } from 'renderer/lib/sound';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { StartRoomButtonView } from './StartRoomButtonView';

type Props = {
  isStandaloneChat: boolean;
};

const StartRoomButtonPresenter = ({ isStandaloneChat }: Props) => {
  const roomsStore = useRoomsStore();
  const { loggedInAccount } = useAppState();
  const { friends, chatStore } = useShipStore();
  const { selectedChat, subroute, setSubroute } = chatStore;
  const sound = useSound();

  const existingRoom = roomsStore.getRoomByPath(selectedChat?.path ?? '');
  const areWeInRoom = existingRoom?.present?.includes(
    loggedInAccount?.serverId ?? ''
  );
  const participants =
    existingRoom?.present.map((patp: string) => {
      return friends.getContactAvatarMetadata(patp);
    }) ?? [];

  const onClickButton = async () => {
    if (!selectedChat) return;

    const areWeInRoomInOtherChat =
      roomsStore.currentRoom &&
      roomsStore.currentRoom.path !== selectedChat.path;
    if (areWeInRoomInOtherChat) {
      // LEAVE OTHER ROOM
      sound.playRoomLeave();
      roomsStore.leaveRoom(roomsStore.currentRoom.rid);
      // DELETE OTHER ROOM IF EMPTY
      if (roomsStore.currentRoom?.present.length === 0) {
        roomsStore.deleteRoom(roomsStore.currentRoom.rid);
      }
    }

    if (existingRoom) {
      if (areWeInRoom) {
        // LEAVE ROOM
        sound.playRoomLeave();
        roomsStore.leaveRoom(existingRoom.rid);
        if (subroute === 'room') setSubroute('chat');

        // DELETE ROOM IF EMPTY
        if (existingRoom?.present.length === 0) {
          roomsStore.deleteRoom(existingRoom.rid);
        }
      } else {
        // JOIN ROOM
        sound.playRoomEnter();
        await roomsStore.joinRoom(existingRoom.rid);
        if (isStandaloneChat) setSubroute('room');
      }
    } else {
      // CREATE ROOM
      sound.playRoomEnter();
      const newRoomRid = await roomsStore?.createRoom(
        selectedChat.metadata.title,
        'public',
        selectedChat.path
      );
      await roomsStore.joinRoom(newRoomRid);
      if (isStandaloneChat) setSubroute('room');
    }
  };

  const onClickAvatar = () => {
    if (existingRoom && isStandaloneChat) {
      setSubroute('room');
    }
  };

  return (
    <StartRoomButtonView
      participants={participants}
      state={existingRoom ? (areWeInRoom ? 'leave' : 'join') : 'start'}
      isStandaloneChat={isStandaloneChat}
      onClickButton={onClickButton}
      onClickAvatar={onClickAvatar}
    />
  );
};

export const StartRoomButton = observer(StartRoomButtonPresenter);
