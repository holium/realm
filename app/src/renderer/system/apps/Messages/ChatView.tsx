import { createRef, FC, useEffect, useState } from 'react';
import { toJS } from 'mobx';
import { lighten, rgba, darken } from 'polished';
import { observer } from 'mobx-react';
import ScrollView from 'react-inverted-scrollview';
import { useMst } from '../../../logic/store';
import { Flex, IconButton, Icons, Input } from '../../../components';
import { WindowThemeType } from '../../../logic/stores/config';
import { MessageType, ChatMessage } from './components/ChatMessage';

type IProps = {
  theme: WindowThemeType;
  height: number;
  contact: string;
  dimensions: {
    height: number;
    width: number;
  };
  onSend: (message: any) => void;
};

export const ChatView: FC<IProps> = observer((props: IProps) => {
  let scrollView = createRef();
  const { dimensions, contact, height, theme, onSend } = props;
  const [showJumpBtn, setShowJumpBtn] = useState(false);

  const { shipStore } = useMst();

  useEffect(() => {
    // shipStore.session?.chat.getDMs();
  }, []);

  const handleScroll = ({
    scrollTop,
    scrollBottom,
  }: {
    scrollTop: any;
    scrollBottom: any;
  }) => {
    if (scrollBottom > 200) {
      setShowJumpBtn(true);
    } else {
      setShowJumpBtn(false);
    }
    console.log({ scrollTop, scrollBottom });
  };
  const scrollToBottom = () => {
    if (!scrollView) return;
    // @ts-expect-error i know
    scrollView.scrollToBottom();
  };
  const padding = 8;
  const inputHeight = 50;
  const titleBarHeight = 61;
  const iconColor = darken(0.5, theme.textColor);

  const chatLog = shipStore.session?.chat.dms.get(contact);
  return (
    <Flex gap={2} mb={3} height={height} position="relative" overflowY="scroll">
      <ScrollView
        width={dimensions.width - padding * 2}
        height={dimensions.height - inputHeight - titleBarHeight}
        ref={scrollView}
        onScroll={handleScroll}
      >
        {chatLog.list.map((message: MessageType, index: number) => (
          <ChatMessage
            key={`${message.timeSent}-${message.author}-${message.type}-${index}`}
            theme={theme}
            our={shipStore.session.patp}
            ourColor={shipStore.session.color}
            message={message}
          />
        ))}
      </ScrollView>
      {showJumpBtn && (
        <Flex position="absolute" bottom={inputHeight + 4} right={12}>
          {/* TODO make a circle bg for this */}
          <IconButton style={{ borderRadius: 14 }} size={28}>
            <Icons name="ArrowDown" />
          </IconButton>
        </Flex>
      )}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        height={inputHeight}
      >
        <Flex flex={1} pl={2} pr={2} alignItems="center">
          <IconButton
            color={iconColor}
            ml={0}
            mr={2}
            size={28}
            onClick={(evt: any) => {
              evt.stopPropagation();
              scrollToBottom();
            }}
          >
            <Icons name="Attachment" />
          </IconButton>
          <Flex flex={1}>
            <Input
              height={32}
              placeholder="Write a message"
              wrapperStyle={{
                borderRadius: 18,
                backgroundColor: lighten(0.24, theme.backgroundColor),
                '&:hover': {
                  borderColor: theme.backgroundColor,
                },
                borderColor: rgba(theme.backgroundColor, 0.6),
              }}
            />
          </Flex>
          <IconButton color={iconColor} ml={2} mr={0} size={28}>
            <Icons name="Emoji" />
          </IconButton>
        </Flex>
      </Flex>
      {/* {chatLog} */}
    </Flex>
  );
});
