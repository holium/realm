import { observer } from 'mobx-react';

import { useRoomsStore } from 'renderer/apps/Rooms/store/RoomsStoreContext';
import { useTrayApps } from 'renderer/apps/store';
import { useSound } from 'renderer/lib/sound';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

import { StartRoomButtonView } from './StartRoomButtonView';

type Props = {
  isStandaloneChat: boolean;
};

const StartRoomButtonPresenter = ({ isStandaloneChat }: Props) => {
  const roomsStore = useRoomsStore();
  const { roomsApp } = useTrayApps();
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

    // only one interactive (video/audio) session at a time
    if (roomsApp.liveRoomId) {
      console.log('StartRoomButton (deleteRoom) %o', roomsApp.liveRoomId);
      roomsStore.deleteRoom(roomsApp.liveRoomId);
    }

    const areWeAlreadyInRoom = existingRoom?.present.includes(
      loggedInAccount?.serverId ?? ''
    );
    if (areWeAlreadyInRoom) {
      if (subroute === 'room') setSubroute('chat');

      return;
    }

    if (existingRoom) {
      // JOIN ROOM
      await roomsStore.joinRoom(existingRoom.rid);
      if (isStandaloneChat) setSubroute('room');
    } else {
      // CREATE ROOM
      const newRoomRid = await roomsStore?.createRoom(
        selectedChat.metadata.title,
        'public',
        selectedChat.path
      );
      await roomsStore.joinRoom(newRoomRid);
      if (isStandaloneChat) setSubroute('room');
    }

    sound.playRoomEnter();
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
