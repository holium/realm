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
  headerOffset: number;
  dimensions: {
    height: number;
    width: number;
  };
  onSend: (message: any) => void;
};

export const ChatView: FC<IProps> = observer((props: IProps) => {
  let scrollView = createRef();
  const { dimensions, contact, height, theme, headerOffset, onSend } = props;
  const { backgroundColor, textColor } = props.theme;

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
    <Flex
      gap={2}
      mb={2}
      height={height}
      position="relative"
      overflowY="scroll"
      alignContent="center"
    >
      <ScrollView
        width={dimensions.width}
        height={dimensions.height}
        ref={scrollView}
        onScroll={handleScroll}
      >
        <Flex style={{ minHeight: headerOffset }} />
        {chatLog.list.map((message: MessageType, index: number) => (
          <ChatMessage
            key={`${message.timeSent}-${message.author}-${message.type}-${index}`}
            theme={theme}
            our={shipStore.session.patp}
            ourColor={shipStore.session.color}
            message={message}
          />
        ))}
        <Flex style={{ minHeight: inputHeight }} />
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
        style={{
          background: rgba(lighten(0.2, backgroundColor), 0.9),
          backdropFilter: 'blur(8px)',
          borderTop: `1px solid ${rgba(backgroundColor, 0.7)}`,
        }}
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
                backgroundColor: lighten(0.3, backgroundColor),
                '&:hover': {
                  borderColor: backgroundColor,
                },
                borderColor: rgba(backgroundColor, 0.7),
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
