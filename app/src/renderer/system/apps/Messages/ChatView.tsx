import { createRef, FC, useEffect, useState } from 'react';
import { toJS } from 'mobx';
import { lighten, rgba, darken } from 'polished';
import { observer } from 'mobx-react';
import ScrollView from 'react-inverted-scrollview';
import { useMst, useShip } from '../../../logic/store';
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
  const { backgroundColor, windowColor, iconColor, dockColor } = props.theme;

  const [showJumpBtn, setShowJumpBtn] = useState(false);

  const { ship } = useShip();

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
    // console.log({ scrollTop, scrollBottom });
  };
  const scrollToBottom = () => {
    if (!scrollView) return;
    // @ts-expect-error i know
    scrollView.scrollToBottom();
  };
  const inputHeight = 58;

  const chatLog = ship!.chat.dms.get(contact)!;
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
            our={ship!.patp}
            ourColor={ship!.color || '#569BE2'}
            message={message}
          />
        ))}
        <Flex style={{ minHeight: inputHeight }} />
      </ScrollView>
      {showJumpBtn && (
        <Flex position="absolute" bottom={inputHeight + 4} right={12}>
          {/* TODO make a circle bg for this */}
          <IconButton
            color={iconColor}
            customBg={dockColor}
            style={{ borderRadius: 14, cursor: 'none' }}
            size={28}
          >
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
          background: rgba(lighten(0.225, windowColor!), 0.9),
          backdropFilter: 'blur(8px)',
          borderTop: `1px solid ${rgba(windowColor!, 0.7)}`,
          minHeight: inputHeight,
        }}
      >
        <Flex flex={1} pl={2} pr={2} mb={1} alignItems="center">
          <IconButton
            style={{ cursor: 'none' }}
            color={iconColor}
            customBg={dockColor}
            ml={2}
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
              className="realm-cursor-text-cursor"
              height={32}
              placeholder="Write a message"
              wrapperStyle={{
                borderRadius: 18,
                backgroundColor: rgba(backgroundColor, 0.2),
                '&:hover': {
                  borderColor: backgroundColor,
                },
                borderColor: rgba(backgroundColor, 0.7),
              }}
            />
          </Flex>
          <IconButton
            style={{ cursor: 'none' }}
            color={iconColor}
            customBg={dockColor}
            ml={2}
            mr={2}
            size={28}
          >
            <Icons name="Emoji" />
          </IconButton>
        </Flex>
      </Flex>
      {/* {chatLog} */}
    </Flex>
  );
});
