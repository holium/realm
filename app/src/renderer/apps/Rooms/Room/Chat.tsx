import { FC } from 'react';
import { Flex, Text, Input, TextButton, Spinner } from 'renderer/components';
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

import { Bubble } from 'renderer/apps/Messages/components/Bubble';


interface RoomChatProps {
}



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



  const chats = roomsApp.chats;



  const handleChat = (evt: any) => {
    setLoading(true);
    const { text } = form.actions.submit();
    evt.stopPropagation();
    console.log('sending chat:', text);
    RoomsActions.sendChat(ship!.patp, text
    ).then(() => {
      setLoading(false);
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

    <Flex style={{ marginTop: 58 }} flex={1} flexDirection="column">
      {chats.length === 0 && (
          <Flex
            flex={1}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            mb={46}
          >
            <Text fontWeight={500} mb={2} opacity={0.5}>
              No chat history
            </Text>
          </Flex>
        )}
        {chats.map((chat: ChatModelType, index: number) => (
              // <ChatMessage
              //   key={`${chat.index}-${chat.timeReceived}-${index}`}
              //   theme={desktop.theme}
              //   our={ship!.patp}
              //   ourColor={ship!.color || '#569BE2'}
              //   message={chatToMessageType(chat)}
              // />
              <Flex key={index} 
                // primary={chat.isRightAligned}
                // customBg={chat.isRightAligned ? ship?.color! : lighten(0.1, desktop.theme!.windowColor)}
              >
                <Text>{`${chat.author} : ${chat.contents}`}</Text>

              {/* </Bubble> */}
              </Flex>
            ))}
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
            placeholder="..."
            autoFocus
            wrapperStyle={{
              cursor: 'none',
              borderRadius: 6,
              // backgroundColor: inputColor,
            }}
            value={text.state.value}
            error={!text.computed.isDirty || text.computed.error}
            onChange={(e: any) => {
              text.actions.onChange(e.target.value);
            }}
            onFocus={() => text.actions.onFocus()}
            onBlur={() => text.actions.onBlur()}
          />
          <TextButton
            tabIndex={2}
            showBackground
            textColor="#0FC383"
            highlightColor="#0FC383"
            disabled={!form.computed.isValid || loading}
            style={{ borderRadius: 6, height: 34 }}
            onKeyDown={(evt: any) => {
              if (evt.key === 'Enter') {
                handleChat(evt);
              }
            }}
            onClick={(evt: any) => {
              handleChat(evt);
            }}
          >
            {loading ? <Spinner size={0} /> : 'Send'}
          </TextButton>
        </Flex>
  </Flex>
  </Flex>
 );
}
)