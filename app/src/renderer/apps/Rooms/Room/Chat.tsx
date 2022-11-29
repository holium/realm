import { FC, useRef, useMemo, useState } from 'react';
import {
  Flex,
  Text,
  Input,
  Spinner,
  IconButton,
  Icons,
} from 'renderer/components';
import { createField, createForm } from 'mobx-easy-form';
import { observer } from 'mobx-react';
import { useTrayApps } from 'renderer/apps/store';
import { RoomsActions } from 'renderer/logic/actions/rooms';
import { useServices } from 'renderer/logic/store';
import { Box, WindowedList } from '@holium/design-system';
import { RoomChatMessage } from './RoomChatMessage';

interface RoomChatProps {}

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

export const RoomChat: FC<RoomChatProps> = observer((props: RoomChatProps) => {
  const { text } = useMemo(() => chatForm(), []);
  const [loading, setLoading] = useState(false);
  const { roomsApp } = useTrayApps();
  const { theme: themeStore, ship } = useServices();

  const theme = themeStore.currentTheme;

  const chatInputRef = useRef<HTMLInputElement>(null);

  const chats = roomsApp.chats.slice(0).reverse();

  const handleChat = (evt: any) => {
    evt.preventDefault();
    evt.stopPropagation();

    if (chatInputRef.current === null) return;

    const innerText = chatInputRef.current.value;

    if (innerText === '') return;

    setLoading(true);

    console.log('sending chat:', innerText);

    RoomsActions.sendChat(ship!.patp, innerText).then(() => {
      setLoading(false);
      text.actions.onChange('');
    });
  };

  const ChatList = useMemo(() => {
    if (chats.length === 0) {
      return (
        <Flex
          height={330}
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
      <Box height={330}>
        <WindowedList
          width={354}
          data={chats}
          sort={(a, b) => a.timeReceived - b.timeReceived}
          rowRenderer={(chat, index) => (
            <RoomChatMessage
              key={chat.index}
              chat={chat}
              doesPack={
                index === 0 ||
                // pack if last guy is the same as the current guy
                chats[index - 1].author === chat.author
                // and the last guy isn't too old (2 minutes)
                // chats[index - 1].timeReceived + 1000 < chat.timeReceived
              }
            />
          )}
          startAtBottom
        />
      </Box>
    );
  }, [chats]);

  return (
    <Flex flex={1} flexDirection="column">
      {ChatList}

      <Flex
        flexDirection="row"
        alignItems="center"
        pt={2}
        px={3}
        style={{
          gap: 8,
        }}
      >
        <Input
          tabIndex={2}
          className="realm-cursor-text-cursor"
          type="text"
          placeholder="whats up dawg"
          autoFocus
          ref={chatInputRef}
          spellCheck={false}
          wrapperStyle={{
            cursor: 'none',
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
                {loading ? (
                  <Spinner size={0} />
                ) : (
                  <Icons opacity={0.5} name="ArrowRightLine" />
                )}
              </IconButton>
            </Flex>
          }
        />
      </Flex>
    </Flex>
  );
});
