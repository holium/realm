import { observer } from 'mobx-react';

import { useTrayApps } from 'renderer/apps/store';
import { useStorage } from 'renderer/lib/useStorage';
import { useShipStore } from 'renderer/stores/ship.store';

import { RoomChatLog } from './RoomChatLog';

const RoomChatPresenter = () => {
  const storage = useStorage();
  const { getTrayAppHeight } = useTrayApps();
  const listHeight = getTrayAppHeight() - 250;
  const { roomsStore } = useShipStore();

  console.log('rendering the chatlog');
  roomsStore.chat;
  return (
    <RoomChatLog
      storage={storage}
      selectedChat={roomsStore.chat}
      height={listHeight}
    />
  );
};

export const RoomChat = observer(RoomChatPresenter);
