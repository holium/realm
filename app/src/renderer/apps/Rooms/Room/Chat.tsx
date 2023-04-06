import { useRef, useMemo, useCallback } from 'react';
import { Flex, Text, Input, IconButton, Icons } from 'renderer/components';
import { createField, createForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import { useServices } from 'renderer/logic/store';
import { WindowedList } from '@holium/design-system';
import { RoomChatMessage } from './RoomChatMessage';
import { useRooms } from '../useRooms';

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
  const { theme: themeStore, ship } = useServices();

  const roomsManager = useRooms(ship?.patp);

  const theme = themeStore.currentTheme;

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
          <Text fontWeight={500} opacity={0.5}>
            No Chat History
          </Text>
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
        <Input
          tabIndex={2}
          type="text"
          placeholder="whats up dawg"
          autoFocus
          innerRef={chatInputRef}
          spellCheck={false}
          wrapperStyle={{
            borderRadius: 6,
            backgroundColor: theme.inputColor,
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
          rightIcon={
            <Flex justifyContent="center" alignItems="center">
              <IconButton
                luminosity={theme.mode}
                size={24}
                canFocus
                onClick={(evt: any) => {
                  handleChat(evt);
                }}
              >
                <Icons opacity={0.5} name="ArrowRightLine" />
              </IconButton>
            </Flex>
          }
        />
      </Flex>
    </Flex>
  );
};

export const RoomChat = observer(RoomChatPresenter);
