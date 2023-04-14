import { useRef, useMemo, useCallback } from 'react';
import { createField, createForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import {
  Flex,
  Text,
  TextInput,
  Button,
  Icon,
  WindowedList,
} from '@holium/design-system';
import { RoomChatMessage } from '../components/RoomChatMessage';
import { useRooms } from '../useRooms';
import { useShipStore } from 'renderer/stores/ship.store';

export const chatForm = (
  defaults: any = {
    netChat: '',
  }
) => {
  const form = createForm({
    onSubmit({ values }: { values: any }) {
      return values;
    },
  });

  const text = createField({
    id: 'text',
    form,
    initialValue: defaults.name || '',
  });

  return {
    form,
    text,
  };
};

const RoomChatPresenter = () => {
  const { text } = useMemo(() => chatForm(), []);
  const { getTrayAppHeight } = useTrayApps();
  const listHeight = getTrayAppHeight() - 164;
  const { ship } = useShipStore();

  const roomsManager = useRooms(ship?.patp);

  const chatInputRef = useRef<HTMLInputElement>(null);

  const chats = roomsManager.live.chat.slice(0);

  const handleChat = useCallback(
    (evt: any) => {
      evt.preventDefault();
      evt.stopPropagation();
      if (chatInputRef.current === null) return;
      const innerText = chatInputRef.current.value;
      if (innerText === '') return;
      roomsManager.sendChat(innerText);
      text.actions.onChange('');
    },
    [roomsManager.presentRoom, text.actions]
  );

  const ChatList = useMemo(() => {
    if (chats.length === 0) {
      return (
        <Flex
          height="100%"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Text.Custom fontWeight={500} opacity={0.5}>
            No Chat History
          </Text.Custom>
        </Flex>
      );
    }

    return (
      <WindowedList
        width={354}
        height={listHeight}
        data={chats.sort((a, b) => a.timeReceived - b.timeReceived)}
        itemContent={(index, chat) => (
          <RoomChatMessage
            key={chat.index}
            chat={chat}
            doesPack={
              chats[index - 1] &&
              // pack if last guy is the same as the current guy
              chats[index - 1].author === chat.author
              // and the last guy isn't too old (2 minutes)
              // chats[index - 1].timeReceived + 1000 < chat.timeReceived
            }
          />
        )}
      />
    );
  }, [chats]);

  return (
    <Flex flex={1} flexDirection="column">
      {ChatList}
      <Flex
        flexDirection="row"
        alignItems="center"
        pt={2}
        pb={2}
        px={3}
        style={{
          gap: 8,
        }}
      >
        <TextInput
          tabIndex={2}
          id="chat-input"
          name="chat-input"
          type="text"
          placeholder="whats up dawg"
          autoFocus
          ref={chatInputRef}
          spellCheck={false}
          style={{
            borderRadius: 6,
          }}
          value={text.state.value}
          error={
            text.computed.isDirty && text.computed.ifWasEverBlurredThenError
          }
          onChange={(e: any) => {
            text.actions.onChange(e.target.value);
          }}
          onKeyDown={(evt: any) => {
            if (evt.key === 'Enter') {
              handleChat(evt);
            }
          }}
          onFocus={() => text.actions.onFocus()}
          onBlur={() => text.actions.onBlur()}
          rightAdornment={
            <Flex justifyContent="center" alignItems="center">
              <Button.IconButton
                size={24}
                onClick={(evt: any) => {
                  handleChat(evt);
                }}
              >
                <Icon size={18} opacity={0.5} name="ArrowRightLine" />
              </Button.IconButton>
            </Flex>
          }
        />
      </Flex>
    </Flex>
  );
};

export const RoomChat = observer(RoomChatPresenter);
