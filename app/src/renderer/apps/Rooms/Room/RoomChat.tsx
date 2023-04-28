import { observer } from 'mobx-react';

import { useStorage } from 'renderer/lib/useStorage';
import { useShipStore } from 'renderer/stores/ship.store';

import { RoomChatLog } from './RoomChatLog';

const RoomChatPresenter = () => {
  const storage = useStorage();
  const { roomsStore } = useShipStore();

  console.log('roomsStorechat', roomsStore.chat);
  return <RoomChatLog storage={storage} selectedChat={roomsStore.chat} />;
};

export const RoomChat = observer(RoomChatPresenter);
