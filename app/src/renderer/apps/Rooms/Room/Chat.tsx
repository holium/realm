import { useCallback, useMemo, useRef } from 'react';
import { createField, createForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';

import { Bubble } from '@holium/design-system/blocks';
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  WindowedList,
} from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';

import { useTrayApps } from 'renderer/apps/store';
import { useAppState } from 'renderer/stores/app.store';

import { useRoomsStore } from '../store/RoomsStoreContext';

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
  const { loggedInAccount } = useAppState();
  const roomsStore = useRoomsStore();
  const { getTrayAppHeight } = useTrayApps();
  const listHeight = getTrayAppHeight() - 168;

  const chatInputRef = useRef<HTMLInputElement>(null);

  const chats = roomsStore.chat.slice(0);
  const ourColor = loggedInAccount?.color || '#000';

  const handleChat = useCallback(
    (evt: any) => {
      evt.preventDefault();
      evt.stopPropagation();
      if (chatInputRef.current === null) return;
      if (!roomsStore.currentRid) return;
      const innerText = chatInputRef.current.value;
      if (innerText === '') return;
      roomsStore.sendChat(roomsStore.currentRid, innerText);
      text.actions.onChange('');
    },
    [roomsStore.currentRid, text.actions]
  );

  const ChatList = useMemo(() => {
    if (chats.length === 0) {
      return (
        <Flex
          height="100%"
          width="100%"
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
        alignToBottom
        chatMode
        shiftScrollbar
        followOutput={true}
        itemContent={(index, chat) => (
          <Box pt="2px">
            <Bubble
              id={`chat-${chat.index}`}
              isOur={chat.author === window.ship}
              author={chat.author}
              ourColor={ourColor}
              authorColor="rgba(var(--rlm-text-rgba), 0.7)"
              sentAt={new Date(chat.timeReceived).toISOString()}
              isPrevGrouped={
                chats[index - 1] && chats[index - 1].author === chat.author
              }
              message={[
                {
                  plain: chat.contents,
                },
              ]}
              onReaction={() => {}}
            />
          </Box>
        )}
      />
    );
  }, [chats]);

  return (
    <Flex position="relative" bottom={50} flex={1} flexDirection="column">
      <Flex position="absolute" top={50} bottom={10} left={0} right={0}>
        {ChatList}
      </Flex>
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        flexDirection="row"
        alignItems="center"
        pt={2}
        pb={2}
        // px={3}
        style={{
          gap: 8,
        }}
      >
        <TextInput
          tabIndex={2}
          id="chat-input"
          name="chat-input"
          type="text"
          placeholder="New message"
          autoFocus
          ref={chatInputRef}
          spellCheck={false}
          inputStyle={{
            paddingLeft: 8,
            paddingRight: 6,
          }}
          style={{
            width: '100%',
            height: 24,
            borderRadius: 16,
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
