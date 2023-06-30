import { observer } from 'mobx-react';

import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { SoundActions } from 'renderer/lib/sound';
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
      SoundActions.playRoomLeave();
      roomsStore.leaveRoom(roomsStore.currentRoom.rid);
    }

    if (existingRoom) {
      if (areWeInRoom) {
        if (existingRoom?.present.length === 1) {
          // DELETE ROOM
          SoundActions.playRoomLeave();
          roomsStore.deleteRoom(existingRoom.rid);
          if (subroute === 'room') setSubroute('chat');
        } else {
          // LEAVE ROOM
          SoundActions.playRoomLeave();
          roomsStore.leaveRoom(existingRoom.rid);
          if (subroute === 'room') setSubroute('chat');
        }
      } else {
        // JOIN ROOM
        SoundActions.playRoomEnter();
        await roomsStore.joinRoom(existingRoom.rid);
        if (isStandaloneChat) setSubroute('room');
      }
    } else {
      // CREATE ROOM
      SoundActions.playRoomEnter();
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
