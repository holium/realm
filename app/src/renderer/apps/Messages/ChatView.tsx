/**
 * Virtual renderers:
 * - https://github.com/wellyshen/react-cool-virtual
 */

import {
  FC,
  useEffect,
  useState,
  useMemo,
  useRef,
  ChangeEventHandler,
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
import {
  FileUploadSource,
  useFileUpload,
} from 'renderer/logic/lib/useFileUpload';
import { SoundActions } from 'renderer/logic/actions/sound';
import { GroupSigil } from './components/GroupSigil';
import { useTrayApps } from '../store';

interface IProps {
  theme: ThemeModelType;
  height: number;
  selectedChat: DMPreviewType;
  headerOffset: number;
  // s3Client: S3Client;
  dimensions: {
    height: number;
    width: number;
  };
  onSend: (message: any) => void;
  setSelectedChat: (chat: any) => void;
}

export const ChatView: FC<IProps> = observer((props: IProps) => {
  const submitRef = useRef(null);
  const chatInputRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const { selectedChat, setSelectedChat, height, theme, onSend } = props;
  const { iconColor, dockColor, textColor, windowColor, mode } = props.theme;
  const [showJumpBtn, setShowJumpBtn] = useState(false);
  const { dmForm, dmMessage } = useMemo(() => createDmForm(undefined), []);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const { courier } = useServices();
  const dmLog = courier.dms.get(selectedChat.path);
  const messages = dmLog?.messages || [];
  const resetLoading = () => setLoading(false);
  const { dmApp } = useTrayApps();
  useEffect(() => {
    if (!selectedChat.isNew) {
      setLoading(true);
      let path = selectedChat.path.substring(1);
      if (selectedChat.type === 'group') {
        ShipActions.readGroupDm(path);
        path = `group/${path}`;
      } else {
        ShipActions.readDm(selectedChat.to as string);
        path = `${path.split('/')[1]}`;
      }
      ShipActions.getDMLog(path).then(resetLoading).catch(resetLoading);
    }
    // when unmounted
    return () => {
      setIsSending(false);
      setLoading(false);
    };
  }, []);

  const { canUpload, uploading, promptUpload, onPaste } = useFileUpload({
    onSuccess: uploadSuccess,
    // onError: handleUploadError,
  });

  function uploadSuccess(url: string, source: FileUploadSource) {
    console.log(url);
    // if (source === 'paste') {
    //   setMessage(url);
    // } else {
    //   onSubmit([{ url }]);
    // }
    // setUploadError('');
  }

  const [rows, setRows] = useState(1);

  const onBack = () => {
    dmApp.setSelectedChat(null);
    setIsSending(false);
    setLoading(false);
  };

  const uploadFile = (params: FileUploadParams) => {
    ShipActions.uploadFile(params)
      .then((url) => {
        setIsSending(true);
        const content = [{ url }];
        SoundActions.playDMSend();
        DmActions.sendDm(selectedChat.path, content)
          .then((res) => {
            setIsSending(false);
          })
          .catch((err) => {
            console.error('dm send error', err);
            setIsSending(false);
          });
      })
      .catch((e) => console.error(e));
  };

  const handleFileChange = (event: ChangeEventHandler<HTMLInputElement>) => {
    // @ts-expect-error
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) {
      return;
    }
    console.log('fileObj is', fileObj);
    // @ts-expect-error
    event.target.value = null;
    // @ts-expect-error
    console.log(event.target.files);
    console.log(fileObj);
    console.log(fileObj.name);
  };

  const submitDm = (event: any) => {
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault();
      if (dmForm.computed.isValid) {
        // @ts-expect-error 2
        submitRef.current.focus();
        // @ts-expect-error
        submitRef.current.click();
        const formData = dmForm.actions.submit();
        const dmMessageContent = formData['dm-message'];
        setIsSending(true);

        SoundActions.playDMSend();
        // @ts-expect-error
        chatInputRef.current.value = '';
        // @ts-expect-error
        chatInputRef.current.focus();

        DmActions.sendDm(selectedChat.path, dmMessageContent)
          .then((res) => {
            setIsSending(false);
          })
          .catch((err) => {
            console.error('dm send error', err);
            setIsSending(false);
          });
      }
    } else if (event.keyCode === 13 && event.shiftKey) {
      // @ts-expect-error
      chatInputRef.current.rows = chatInputRef.current.rows + 1;
    }
  };
  let sigil: any,
    to: string,
    dmModel: PreviewDMType,
    groupModel: PreviewGroupDMType;

  if (selectedChat.type === 'group') {
    groupModel = selectedChat as PreviewGroupDMType;
    to = Array.from(groupModel.to).join(', ');
    sigil = (
      <GroupSigil
        path={groupModel.path}
        patps={groupModel.to}
        metadata={groupModel.metadata}
      />
    );
  } else {
    dmModel = selectedChat as PreviewDMType;
    to = dmModel.to;
    sigil = (
      <Sigil
        simple
        size={28}
        avatar={dmModel.metadata.avatar}
        patp={dmModel.to}
        color={[dmModel.metadata.color || '#000000', 'white']}
      />
    );
  }

  // Only rerender when the data is different
  const ChatLogMemo = useMemo(
    () => (
      <ChatLog
        loading={loading}
        messages={messages}
        isGroup={selectedChat.type === 'group'}
      />
    ),
    [messages, selectedChat.to]
  );

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
        hasBorder={false}
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
              onBack();
            }}
          >
            <Icons name="ArrowLeftLine" />
          </IconButton>
        </Flex>
        <Flex flex={1} gap={10} alignItems="center" flexDirection="row">
          <Box>{sigil}</Box>
          <Text fontSize={3} fontWeight={500}>
            {to}
          </Text>
        </Flex>
        <Flex pl={2} pr={2}>
          {/* <IconButton
            className="realm-cursor-hover"
            customBg={dockColor}
            style={{ cursor: 'none' }}
            size={26}
            onClick={(evt: any) => {
              console.log('initiate call');
            }}
          >
            <Icons name="Phone" />
          </IconButton> */}
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
          {/* <ChatLog loading={loading} messages={messages} /> */}
          <Flex
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            style={{
              background: rgba(windowColor, 0.9),
              backdropFilter: 'blur(16px)',
              // borderTop: `1px solid ${rgba(darken(0.5, windowColor), 0.2)}`,
              minHeight: inputHeight,
            }}
          >
            <Flex flex={1} pr={3} alignItems="center">
              <div ref={containerRef} style={{ display: 'none' }}></div>
              <input
                style={{ display: 'none' }}
                ref={inputRef}
                type="file"
                accept="image/*,.txt,.pdf"
                // @ts-expect-error
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
                  <Icons name="Attachment" />
                </IconButton>
              </Tooltip>
              <Input
                as="textarea"
                ref={chatInputRef}
                tabIndex={1}
                rows={rows}
                autoFocus
                name="dm-message"
                shouldHighlightOnFocus
                className="realm-cursor-text-cursor"
                width="100%"
                placeholder="Write a message"
                rightInteractive
                onKeyDown={submitDm}
                rightIcon={
                  <Flex justifyContent="center" alignItems="center">
                    <IconButton
                      ref={submitRef}
                      luminosity={mode as 'light' | 'dark' | undefined}
                      size={24}
                      canFocus={false}
                      onKeyDown={submitDm}
                    >
                      {!isSending ? (
                        <Icons opacity={0.5} name="ArrowRightLine" />
                      ) : (
                        <Spinner size={0} />
                      )}
                    </IconButton>
                  </Flex>
                }
                onChange={(e: any) =>
                  dmMessage.actions.onChange(e.target.value)
                }
                onPaste={async (evt) => {
                  try {
                    if (!canUpload) return;
                    const fileReader = new FileReader();
                    const clipboardItems = await navigator.clipboard.read();
                    if (!clipboardItems || clipboardItems.length === 0) return;
                    const clipboardItem = clipboardItems[0];
                    if (
                      !clipboardItem.types ||
                      clipboardItem.types.length === 0
                    )
                      return;
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
                          const base64 = dataUrl.substring(
                            dataUrl.indexOf(',') + 1
                          );
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
                }}
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
});
