import {
  useEffect,
  useState,
  useMemo,
  useRef,
  ChangeEventHandler,
  useCallback,
  ClipboardEvent,
  KeyboardEventHandler,
} from 'react';
import { lighten, darken, rgba } from 'polished';
import { observer } from 'mobx-react';
import {
  Flex,
  IconButton,
  Icons,
  Input,
  Sigil,
  Text,
  Grid,
  Box,
  Spinner,
  Tooltip,
} from 'renderer/components';
import { ThemeModelType } from 'os/services/theme.model';
import { createDmForm } from './forms/chatForm';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { useServices } from 'renderer/logic/store';
import { DmActions } from 'renderer/logic/actions/chat';
import {
  DMPreviewType,
  PreviewDMType,
  PreviewGroupDMType,
} from 'os/services/ship/models/courier';
import { ChatLog } from './components/ChatLog';
import { ShipActions } from 'renderer/logic/actions/ship';
import { FileUploadParams } from 'os/services/ship/models/ship';
import { useFileUpload } from 'renderer/logic/lib/useFileUpload';
import { SoundActions } from 'renderer/logic/actions/sound';
import { GroupSigil } from './components/GroupSigil';
import { useTrayApps } from '../store';
import { IuseStorage } from 'renderer/logic/lib/useStorage';
import { GraphDMType } from 'os/services/ship/models/courier';
import { messageIndexGen } from './util';

type Props = {
  theme: ThemeModelType;
  height: number;
  selectedChat: DMPreviewType;
  storage: IuseStorage;
};

export const ChatView = observer(
  ({ selectedChat, height, theme, storage }: Props) => {
    const { iconColor, dockColor, textColor, windowColor, mode } = theme;

    const submitRef = useRef<HTMLButtonElement>(null);
    const chatInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { dmForm, dmMessage } = useMemo(() => createDmForm(undefined), []);
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string>();
    const [loading, setLoading] = useState(false);
    const { courier, ship } = useServices();
    const resetLoading = () => setLoading(false);
    const { dmApp } = useTrayApps();

    const isGroup = useMemo(
      () => selectedChat.type === 'group',
      [selectedChat.type]
    );

    const latestMessages = useMemo(
      () => courier.dms.get(selectedChat.path)?.messages || [],
      [courier.dms, selectedChat.path]
    );
    const [messages, setMessages] = useState<GraphDMType[]>(
      courier.dms.get(selectedChat.path)?.messages || []
    );
    const [optimisticMessages, setOptimisticMessages] = useState<GraphDMType[]>(
      []
    );

    const getPath = useCallback(() => {
      const path = selectedChat.path.substring(1);
      if (isGroup) {
        return `group/${path}`;
      } else {
        return path.split('/')[1];
      }
    }, [isGroup, selectedChat.path]);

    const fetchDms = useCallback(async () => {
      setLoading(true);
      const res = await ShipActions.getDMLog(getPath()).finally(resetLoading);
      if (res && res.length > 0) {
        setMessages(res);
      }
    }, [getPath]);

    useEffect(() => {
      // Watch for new incoming messages.
      const diff = latestMessages.filter((msg) => {
        return (
          msg.author !== ship?.patp &&
          !messages.find((m) => m.index === msg.index)
        );
      });
      if (diff.length) {
        setMessages((msgs) => [...msgs, ...diff]);
      }
    }, [latestMessages, latestMessages.length, messages, ship?.patp]);

    useEffect(() => {
      if (!selectedChat.isNew) {
        fetchDms();
        if (isGroup) {
          ShipActions.readGroupDm(selectedChat.path.substring(1));
        } else {
          ShipActions.readDm(selectedChat.to as string);
        }
      }
      // when unmounted
      return () => {
        setIsSending(false);
        setLoading(false);
      };
    }, [
      isGroup,
      fetchDms,
      selectedChat.isNew,
      selectedChat.path,
      selectedChat.to,
    ]);

    const { canUpload, promptUpload } = useFileUpload({ storage });

    const onBack = () => {
      // In case we have any outstanding optimistic messages we want to refresh
      // so the next time we open the chat we have real messages.
      if (optimisticMessages.length) fetchDms();
      dmApp.setSelectedChat(null);
    };

    const uploadFile = useCallback(
      (params: FileUploadParams) => {
        setIsUploading(true);
        setUploadError('');
        ShipActions.uploadFile(params)
          .then((url) => {
            if (!chatInputRef.current) return;
            chatInputRef.current.value = url;
            chatInputRef.current.focus();
            dmMessage.actions.onChange(chatInputRef.current.value);
          })
          .catch(() => {
            setUploadError('Failed upload, please try again.');
          })
          .finally(() => setIsUploading(false));
      },
      [dmMessage.actions]
    );

    const onPaste = useCallback(
      async (evt: ClipboardEvent<HTMLInputElement>) => {
        try {
          if (!canUpload) return;
          const fileReader = new FileReader();
          const clipboardItems = await navigator.clipboard.read();
          if (!clipboardItems || clipboardItems.length === 0) return;
          const clipboardItem = clipboardItems[0];
          if (!clipboardItem.types || clipboardItem.types.length === 0) return;
          const type = clipboardItem.types[0];
          if (type.startsWith('image/')) {
            evt.preventDefault();
            evt.stopPropagation();
            const blob = await clipboardItem.getType(type);
            // we can now use blob here
            // const content = await blob.text();
            fileReader.addEventListener('loadend', () => {
              // reader.result contains the contents of blob as a data url
              const dataUrl = fileReader.result;
              if (dataUrl && typeof dataUrl === 'string') {
                const base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
                const params: FileUploadParams = {
                  source: 'buffer',
                  content: base64,
                  contentType: type,
                };
                uploadFile(params);
              }
            });
            fileReader.readAsDataURL(blob);
          }
        } catch (err) {
          console.error(err);
        }
      },
      [canUpload, uploadFile]
    );

    const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      const fileObj = event.target.files && event.target.files[0];
      if (!fileObj) {
        return;
      }
      console.log('fileObj is', fileObj);
      // @ts-expect-error
      event.target.value = null;
      console.log(event.target.files);
      console.log(fileObj);
      console.log(fileObj.name);
    };

    const submitDm = useCallback(() => {
      if (dmForm.computed.isValid) {
        console.log('submitting dm');
        const formData = dmForm.actions.submit();
        const dmMessageContent = formData['dm-message'];
        setIsSending(true);

        SoundActions.playDMSend();
        if (chatInputRef.current) {
          chatInputRef.current.value = '';
          chatInputRef.current.focus();
        }

        const [index, timeSent] = messageIndexGen();
        const stringIndex = String(index);
        const optimisticResponse: GraphDMType = {
          index: stringIndex,
          timeSent,
          author: ship!.patp,
          pending: true,
          contents: dmMessageContent,
        };
        setOptimisticMessages((prev) => [...prev, optimisticResponse]);

        DmActions.sendDm(selectedChat.path, dmMessageContent)
          .then(() => {
            // Replace the same optimistic message with a non-pending one.
            const nonPendingMessage = { ...optimisticResponse, pending: false };
            setOptimisticMessages((prev) =>
              prev.map((msg) => {
                if (msg.index === stringIndex) return nonPendingMessage;
                return msg;
              })
            );
          })
          .catch((err) => {
            console.error('dm send error', err);
          })
          .finally(() => {
            setIsSending(false);
          });
      }
    }, [dmForm.actions, dmForm.computed.isValid, selectedChat.path, ship]);

    const onKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
      (event) => {
        if (event.keyCode === 13 && !event.shiftKey) {
          event.preventDefault();
          submitDm();
        } else if (event.keyCode === 13 && event.shiftKey) {
          // @ts-expect-error
          chatInputRef.current.rows = chatInputRef.current.rows + 1;
        }
      },
      [submitDm]
    );

    const to = useMemo(
      () =>
        isGroup ? Array.from(selectedChat.to).join(', ') : selectedChat.to,
      [isGroup, selectedChat.to]
    );

    const sigil = useMemo(() => {
      if (isGroup) {
        const groupModel = selectedChat as PreviewGroupDMType;
        return (
          <GroupSigil
            path={groupModel.path}
            patps={groupModel.to}
            metadata={groupModel.metadata}
          />
        );
      } else {
        const dmModel = selectedChat as PreviewDMType;
        return (
          <Sigil
            simple
            size={28}
            avatar={dmModel.metadata.avatar}
            patp={dmModel.to}
            color={[dmModel.metadata.color || '#000000', 'white']}
          />
        );
      }
    }, [isGroup, selectedChat]);

    const ChatLogMemo = useMemo(
      () => (
        <ChatLog
          key={`${selectedChat.path}-${selectedChat.lastTimeSent}}-${messages.length}-${optimisticMessages.length}`}
          loading={loading}
          messages={[...optimisticMessages, ...messages]}
          isGroup={isGroup}
        />
      ),
      [
        isGroup,
        loading,
        messages,
        optimisticMessages,
        selectedChat.lastTimeSent,
        selectedChat.path,
      ]
    );

    const AttachmentIcon = () => {
      if (isUploading) {
        return <Spinner size={0} />;
      } else if (uploadError) {
        return (
          <Tooltip show position="top" content={uploadError} id="upload-error">
            <Icons name="Error" />
          </Tooltip>
        );
      } else {
        return <Icons name="Attachment" />;
      }
    };

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
          hasBorder={false}
          zIndex={5}
          theme={theme}
        >
          <Flex pl={3} pr={4} justifyContent="center" alignItems="center">
            <IconButton
              className="realm-cursor-hover"
              size={26}
              style={{ cursor: 'none' }}
              customBg={dockColor}
              onClick={(evt: any) => {
                evt.stopPropagation();
                onBack();
              }}
            >
              <Icons name="ArrowLeftLine" />
            </IconButton>
          </Flex>
          <Flex
            flex={1}
            gap={10}
            alignItems="center"
            flexDirection="row"
            maxWidth="100%"
            minWidth={0}
          >
            <Box>{sigil}</Box>
            <Flex flexDirection="column" maxWidth="100%" minWidth={0}>
              <Tooltip show placement="top" content={to} id="dm-tooltip">
                <Text
                  fontSize={3}
                  fontWeight={500}
                  style={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {to}
                </Text>
              </Tooltip>
              {isGroup && (
                <Text fontSize={1} fontWeight={400} opacity={0.5}>
                  {selectedChat.to.length} people
                </Text>
              )}
            </Flex>
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
            backgroundColor: windowColor,
            transform: 'translate3d(0, 0, 0)',
          }}
          overflowY="hidden"
        >
          <Flex
            gap={2}
            height={height}
            width="100%"
            position="relative"
            overflowY="auto"
            alignContent="center"
          >
            {ChatLogMemo}
            <Flex
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              style={{
                background: rgba(windowColor, 0.9),
                backdropFilter: 'blur(16px)',
                // borderTop: `1px solid ${rgba(darken(0.5, windowColor), 0.2)}`,
                minHeight: 60,
              }}
            >
              <Flex flex={1} pr={3} alignItems="center">
                <div ref={containerRef} style={{ display: 'none' }}></div>
                <input
                  style={{ display: 'none' }}
                  ref={inputRef}
                  type="file"
                  accept="image/*,.txt,.pdf"
                  onChange={handleFileChange}
                />
                <Tooltip
                  show={!canUpload}
                  placement="top"
                  content={'No image store set up'}
                  id={`upload-tooltip`}
                >
                  <IconButton
                    style={{ cursor: 'none' }}
                    color={canUpload ? iconColor : lighten(0.5, iconColor)}
                    customBg={dockColor}
                    ml={3}
                    mr={3}
                    size={28}
                    onClick={(evt: any) => {
                      evt.stopPropagation();
                      if (!canUpload) return;
                      if (!containerRef.current) return;
                      promptUpload(containerRef.current)
                        .then((file: File) => {
                          const params: FileUploadParams = {
                            source: 'file',
                            content: file.path,
                            contentType: file.type,
                          };
                          uploadFile(params);
                        })
                        .catch((e) => console.error(e));
                    }}
                  >
                    <AttachmentIcon />
                  </IconButton>
                </Tooltip>
                <Input
                  as="textarea"
                  ref={chatInputRef}
                  tabIndex={1}
                  rows={1}
                  autoFocus
                  name="dm-message"
                  shouldHighlightOnFocus
                  className="realm-cursor-text-cursor"
                  width="100%"
                  placeholder="Write a message"
                  rightInteractive
                  onKeyDown={onKeyDown}
                  rightIcon={
                    <Flex justifyContent="center" alignItems="center">
                      <IconButton
                        ref={submitRef}
                        luminosity={mode as 'light' | 'dark' | undefined}
                        size={24}
                        canFocus={false}
                        disabled={isSending}
                        onClick={submitDm}
                      >
                        {!isSending ? (
                          <Icons opacity={0.5} name="ArrowRightLine" />
                        ) : (
                          <Spinner size={0} />
                        )}
                      </IconButton>
                    </Flex>
                  }
                  onChange={(e) => dmMessage.actions.onChange(e.target.value)}
                  onPaste={onPaste}
                  onFocus={() => dmMessage.actions.onFocus()}
                  onBlur={() => dmMessage.actions.onBlur()}
                  wrapperStyle={{
                    height: 'max-content',
                    borderRadius: 9,
                    // borderWidth: 0,
                    borderColor: 'transparent',
                    backgroundColor:
                      theme.mode === 'dark'
                        ? lighten(0.1, windowColor)
                        : darken(0.055, windowColor),
                  }}
                />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Grid.Column>
    );
  }
);
