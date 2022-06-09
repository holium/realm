import { createRef, FC, useEffect, useState, useMemo, useRef } from 'react';
import { toJS } from 'mobx';
import { lighten, rgba, darken } from 'polished';
import { observer } from 'mobx-react';
import ScrollView from 'react-inverted-scrollview';
import { useMst, useShip } from 'renderer/logic/store';
import {
  Flex,
  IconButton,
  Icons,
  Input,
  FormControl,
  FormField,
} from 'renderer/components';
import { WindowThemeType } from 'renderer/logic/stores/config';
import { MessageType, ChatMessage } from './components/ChatMessage';
import { createDmForm } from './chatForm';
import { sendDm } from 'renderer/logic/ship/chat/api';

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
  const submitRef = useRef(null);
  let scrollView = createRef();
  const { dimensions, contact, height, theme, headerOffset, onSend } = props;
  const { backgroundColor, windowColor, iconColor, dockColor, textTheme } =
    props.theme;
  const [showJumpBtn, setShowJumpBtn] = useState(false);
  const { dmForm, dmMessage } = useMemo(() => createDmForm(undefined), []);

  const { ship } = useShip();

  useEffect(() => {
    // shipStore.session?.chat.getDMs();
  }, []);

  const submitDm = (event: any) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      // @ts-ignore 2
      submitRef.current.focus();
      // @ts-ignore
      submitRef.current.click();
      // passwordRef.current.blur();
      // wrapperRef.current.blur();
      const formData = dmForm.actions.submit();
      const dmMessage = formData['dm-message'];
      // console.log(dmMessage);
      sendDm(contact, dmMessage).then((response: any) => {
        console.log('end of promise ', response);
      });
      // console.log(dmForm.actions.submit());
      // (evt: any) => {
      //   if (evt.key === 'Enter') {
      //     // Cancel the default action, if needed
      //     evt.preventDefault();
      //     // Trigger the button element with a click
      //     console.log(dmForm.actions.submit());
      //   }
      // };
      // authStore.login(pendingShip!.patp, event.target.value);
    }
  };

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
              // scrollToBottom();
            }}
          >
            <Icons name="Attachment" />
          </IconButton>

          <Input
            tabIndex={1}
            name="dm-message"
            className="realm-cursor-text-cursor"
            height={32}
            placeholder="Write a message"
            rightInteractive
            onKeyDown={submitDm}
            rightIcon={
              <Flex justifyContent="center" alignItems="center">
                <IconButton
                  ref={submitRef}
                  luminosity={textTheme}
                  size={24}
                  canFocus
                  onKeyDown={submitDm}
                >
                  <Icons opacity={0.5} name="ArrowRightLine" />
                </IconButton>
              </Flex>
            }
            onChange={(e: any) => dmMessage.actions.onChange(e.target.value)}
            onFocus={() => dmMessage.actions.onFocus()}
            onBlur={() => dmMessage.actions.onBlur()}
            wrapperStyle={{
              borderRadius: 18,
              backgroundColor: rgba(backgroundColor, 0.2),
              '&:hover': {
                borderColor: backgroundColor,
              },
              borderColor: rgba(backgroundColor, 0.7),
            }}
          />

          {/* <IconButton
            style={{ cursor: 'none' }}
            color={iconColor}
            customBg={dockColor}
            ml={2}
            mr={2}
            size={28}
          >
            <Icons name="Emoji" />
          </IconButton> */}
        </Flex>
      </Flex>
      {/* {chatLog} */}
    </Flex>
  );
});
