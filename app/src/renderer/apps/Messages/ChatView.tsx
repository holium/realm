/**
 * Virtual renderers:
 * - https://github.com/wellyshen/react-cool-virtual
 */

import { FC, useEffect, useState, useMemo, useRef } from 'react';
import { rgba, darken } from 'polished';
import { observer } from 'mobx-react';
import ScrollView from 'react-inverted-scrollview';

import {
  Flex,
  IconButton,
  Icons,
  Input,
  Sigil,
  Text,
  Grid,
  Box,
} from 'renderer/components';
import { ThemeModelType } from 'os/services/shell/theme.model';
import { MessageType, ChatMessage } from './components/ChatMessage';
import { createDmForm } from './forms/chatForm';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { useServices } from 'renderer/logic/store';
import { DmActions } from 'renderer/logic/actions/chat';

type IProps = {
  theme: ThemeModelType;
  height: number;
  selectedChat: any;
  headerOffset: number;
  dimensions: {
    height: number;
    width: number;
  };
  onSend: (message: any) => void;
  setSelectedChat: (chat: any) => void;
};

export const ChatView: FC<IProps> = observer((props: IProps) => {
  const submitRef = useRef(null);
  const chatInputRef = useRef(null);
  let scrollView = useRef<any>(null);
  const attachmentRef = useRef(null);
  const {
    dimensions,
    selectedChat,
    setSelectedChat,
    height,
    theme,
    headerOffset,
    onSend,
  } = props;
  const {
    inputColor,
    iconColor,
    dockColor,
    textTheme,
    textColor,
    windowColor,
    mode,
  } = props.theme;
  const [showJumpBtn, setShowJumpBtn] = useState(false);
  const { dmForm, dmMessage } = useMemo(() => createDmForm(undefined), []);
  const { ship } = useServices();
  const chatData = ship?.chat.dms.get(selectedChat.contact)!;

  const [rows, setRows] = useState(1);

  const submitDm = (event: any) => {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      if (dmForm.computed.isValid) {
        // @ts-ignore 2
        submitRef.current.focus();
        // @ts-ignore
        submitRef.current.click();
        const formData = dmForm.actions.submit();
        if (formData) console.log(formData);
        const dmMessageContent = formData['dm-message'];
        console.log(selectedChat.contact, dmMessageContent);

        DmActions.sendDm(selectedChat.contact, dmMessageContent);
        // @ts-ignore
        chatInputRef.current.value = '';
      }
    } else if (event.keyCode === 13 && event.shiftKey) {
      // @ts-ignore
      // chatInputRef.current.rows = chatInputRef.current.rows + 1;
    }
    // else {

    // }
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
    scrollView.current.scrollToBottom();
  };

  useEffect(() => {
    scrollView.current?.scrollToBottom();
  }, [scrollView]);

  const inputHeight = 60;
  return (
    <Grid.Column
      style={{ position: 'relative', color: textColor }}
      expand
      noGutter
      overflowY="hidden"
    >
      <Titlebar
        hasBlur
        closeButton={false}
        hasBorder
        zIndex={5}
        theme={{
          ...props.theme,
        }}
      >
        <Flex pl={3} pr={4} justifyContent="center" alignItems="center">
          <IconButton
            className="realm-cursor-hover"
            size={26}
            style={{ cursor: 'none' }}
            customBg={dockColor}
            onClick={(evt: any) => {
              evt.stopPropagation();
              setSelectedChat(null);
            }}
          >
            <Icons name="ArrowLeftLine" />
          </IconButton>
        </Flex>
        <Flex flex={1} gap={10} alignItems="center" flexDirection="row">
          <Box>
            <Sigil
              simple
              size={28}
              avatar={selectedChat.avatar}
              patp={selectedChat.contact}
              color={[selectedChat.sigilColor || '#000000', 'white']}
            />
          </Box>
          <Text fontSize={3} fontWeight={500}>
            {selectedChat.contact}
          </Text>
        </Flex>
        <Flex pl={2} pr={2}>
          <IconButton
            className="realm-cursor-hover"
            customBg={dockColor}
            style={{ cursor: 'none' }}
            size={26}
            onClick={(evt: any) => {
              console.log('initiate call');
            }}
          >
            <Icons name="Phone" />
          </IconButton>
        </Flex>
      </Titlebar>
      <Flex
        style={{
          zIndex: 4,
          position: 'relative',
          bottom: 0,
          left: 0,
          right: 0,
          backfaceVisibility: 'hidden',
          backgroundColor:
            mode === 'light'
              ? darken(0.05, windowColor)
              : darken(0.05, windowColor),
          transform: 'translate3d(0, 0, 0)',
        }}
        overflowY="hidden"
      >
        <Flex
          gap={2}
          height={height}
          position="relative"
          overflowY="auto"
          alignContent="center"
        >
          <ScrollView
            width={dimensions.width}
            height={dimensions.height}
            ref={scrollView}
            onScroll={handleScroll}
            restoreScrollPositionOnUpdate
          >
            <Flex style={{ minHeight: headerOffset + 8 }} />
            {chatData.list.map((message: MessageType, index: number) => (
              <ChatMessage
                key={`${message.index}-${message.timeSent}-${index}`}
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
                style={{
                  borderRadius: 14,
                  cursor: 'none',
                  backdropFilter: 'blur(4px)',
                  background: windowColor,
                }}
                size={28}
                onClick={scrollToBottom}
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
              background: windowColor,
              backdropFilter: 'blur(8px)',
              borderTop: `1px solid ${rgba(darken(0.5, windowColor), 0.2)}`,
              minHeight: inputHeight,
            }}
          >
            <Flex flex={1} pr={3} alignItems="center">
              <IconButton
                style={{ cursor: 'none' }}
                color={iconColor}
                customBg={dockColor}
                ml={3}
                mr={3}
                size={28}
                onClick={(evt: any) => {
                  evt.stopPropagation();
                  // TODO add file uploading
                  // scrollToBottom();
                }}
              >
                <Icons name="Attachment" />
              </IconButton>
              <Input
                as="textarea"
                ref={chatInputRef}
                tabIndex={1}
                rows={rows}
                name="dm-message"
                className="realm-cursor-text-cursor"
                width={300}
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
                onChange={(e: any) =>
                  dmMessage.actions.onChange(e.target.value)
                }
                onFocus={() => dmMessage.actions.onFocus()}
                onBlur={() => dmMessage.actions.onBlur()}
                wrapperStyle={{
                  height: 'max-content',
                  borderRadius: 9,
                  backgroundColor: inputColor,
                }}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Grid.Column>
  );
});
