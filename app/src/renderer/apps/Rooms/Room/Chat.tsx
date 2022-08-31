import { FC, useRef } from 'react';
import { Flex, Text, Input, TextButton, Spinner, IconButton, Icons, Grid } from 'renderer/components';
import { createField, createForm } from 'mobx-easy-form';

import { useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { ChatMessage, MessageType } from 'renderer/apps/Messages/components/ChatMessage';
import { useTrayApps } from 'renderer/apps/store';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { ChatModelType } from 'os/services/tray/rooms.model';
import { RoomsActions } from 'renderer/logic/actions/rooms';
import { useServices } from 'renderer/logic/store';
import { lighten } from 'polished';
import InfiniteScroll from 'react-infinite-scroll-component';

import { Bubble } from 'renderer/apps/Messages/components/Bubble';
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
  const { form, text } = useMemo(() => chatForm(), []);
  const [loading, setLoading] = useState(false);
  const { roomsApp } = useTrayApps();
  const { desktop, ship } = useServices();

  const theme = desktop.theme;

  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatGridRef = useRef(null);

  const chats = roomsApp.chats.slice(0).reverse();

  const handleChat = (evt: any) => {
    
    evt.preventDefault();
    evt.stopPropagation();

    if (chatInputRef.current === null) return;

    let innerText = chatInputRef.current.value;

    if (innerText === '') return;

    setLoading(true);

    console.log('sending chat:', innerText);

    RoomsActions.sendChat(ship!.patp, innerText
    ).then(() => {
      setLoading(false);

      // chatInputRef.current!.value = '';

      // TODO appears to work without a problem
      // but causes a mobx warning
      // [MobX] Since strict-mode is enabled, changing (observed) observable values without using an action is not allowed. Tried to modify: ObservableObject@270.value
      // text.state.value = '';
      text.actions.onChange('');


    });
  };

  // const chatToMessageType = (chat: ChatModelType) => {
  //   let message : MessageType = {
  //     author : chat.author,
  //     contents : [{'text': chat.contents}],
  //     index : String(chat.index),
  //     timeSent : chat.timeReceived,
  //     position : chat.isRightAligned ? 'right' : 'left'
  //     };
  //   return message;
  // }

  return (
  <Flex flex={2} gap={16} p={2} flexDirection="row" alignItems="center">
    <Flex flex={1} flexDirection="column">
        <InfiniteScroll
          dataLength={chats.length}
          height={330}
          next={() => {
            console.log('load more');
          } }
          style={{ display: 'flex', flexDirection: 'column-reverse' }} //To put endMessage and loader to the top.
          inverse={true} //
          hasMore={false}
          loader={<h4>Loading...</h4>}
          scrollableTarget="scrollableDiv"
          >
          {chats.length === 0 && (
          <Flex
            flex={1}
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            // mb={46}
          >
            <Text fontWeight={500} opacity={0.5}>
              No chat history
            </Text>
          </Flex>
            )}
          {chats.map((chat: ChatModelType, index: number) => (
              <RoomChatMessage
                key={chat.index}
                chat={chat} 
                // pack if last guy is the same as the current guy 
                doesPack={ ((index < chats.length - 1) && chats[index+1].author === chat.author) }
                            //     and the last guy isnt too old (2 minutes)
                            // && (chats[index+1].timeReceived >= chat.timeReceived - 1000) }
                />
            ))}
        </InfiniteScroll>

        <Flex
          flexDirection="row"
          alignItems="center"
          mt={2}
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
            wrapperStyle={{
              cursor: 'none',
              borderRadius: 6,
              backgroundColor: theme.inputColor,
            }}
            value={text.state.value}
            // value={''}
            error={!text.computed.isDirty || text.computed.error}
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
                   {loading ? <Spinner size={0} /> : <Icons opacity={0.5} name="ArrowRightLine" /> }
                </IconButton>
              </Flex>
            }
          />
        </Flex>
  </Flex>
  </Flex>
 );
}
)