import {
  useEffect,
  useState,
  useMemo,
  useRef,
  ChangeEventHandler,
  useCallback,
  ClipboardEvent,
  KeyboardEventHandler,
  ChangeEvent,
} from 'react';
import { lighten, darken } from 'polished';
import { observer } from 'mobx-react';
import { Content } from '@urbit/api';
import {
  Avatar,
  Button,
  Icon,
  Text,
  Box,
  Flex,
  Spinner,
  Tooltip,
} from '@holium/design-system';
import { Input } from 'renderer/components';
import { ThemeModelType } from 'os/services/theme.model';
import { createDmForm } from './forms/chatForm';
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
import styled from 'styled-components';

const ChatInputWrapper = styled(Box)`
  /* background: var(--rlm-window-bg); */
  backdrop-filter: blur(24px);
  padding: 0 24px;
`;

type Props = {
  theme: ThemeModelType;
  height: number;
  selectedChat: DMPreviewType;
  storage: IuseStorage;
};

export const ChatView = observer(({ selectedChat, theme, storage }: Props) => {
  const { windowColor } = theme;

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
  const { dmApp } = useTrayApps();

  const isGroup = useMemo(
    () =>
      selectedChat.type === 'group' || selectedChat.type === 'group-pending',
    [selectedChat.type]
  );

  const messages =
    courier.dms
      .get(selectedChat.path)
      ?.messages.slice()
      .sort((a, b) => a.timeSent - b.timeSent) ?? [];
  const lastMessage = messages[messages.length - 1];

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
    const dmLog = await ShipActions.getDmLog(getPath());
    courier.setDmLog(dmLog);
    setLoading(false);
  }, [courier, getPath]);

  useEffect(() => {
    if (!selectedChat.isNew) {
      fetchDms();
    }

    return () => {
      setIsSending(false);
      setLoading(false);
    };
  }, [selectedChat.isNew, fetchDms]);

  useEffect(() => {
    const isFromUs = lastMessage?.author === ship?.patp;
    if (!isFromUs) {
      // Set current chat as read on new messages.
      if (isGroup) {
        ShipActions.readGroupDm(selectedChat.path.substring(1));
      } else {
        ShipActions.readDm(selectedChat.to as string);
      }
    }
  }, [ship, isGroup, selectedChat.path, selectedChat.to, lastMessage?.index]);

  const { canUpload, promptUpload } = useFileUpload({ storage });

  const onBack = () => {
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
    if (dmForm.computed.isValid && !isSending && !loading) {
      setIsSending(true);
      const formData = dmForm.actions.submit();
      const dmMessageContent: Content[] = formData['dm-message'];
      dmMessage.actions.onChange('');

      SoundActions.playDMSend();
      if (chatInputRef.current) {
        chatInputRef.current.value = '';
        chatInputRef.current.style.height = 'auto';
        chatInputRef.current.focus();
      }

      DmActions.sendDm(selectedChat.path, dmMessageContent)
        .catch((err) => {
          console.error('dm send error', err);
        })
        .finally(() => {
          setIsSending(false);
        });
    }
  }, [
    dmForm.actions,
    dmForm.computed.isValid,
    dmMessage.actions,
    isSending,
    loading,
    getPath,
    selectedChat.path,
  ]);

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      if (event.keyCode === 13 && !event.shiftKey) {
        event.preventDefault();
        submitDm();
      }
    },
    [submitDm]
  );

  const updateInputHeight = useCallback((inputRef: HTMLInputElement) => {
    const padding = 16;
    const lineHeight = 17;
    const minHeight = 33;
    const maxHeight = minHeight + lineHeight * 3;
    const numberOfLines = inputRef.value.split(/\r*\n/).length;
    const newHeight = numberOfLines * lineHeight + padding;

    if (newHeight > maxHeight) {
      inputRef.style.height = maxHeight + 'px';
    } else if (newHeight < minHeight) {
      inputRef.style.height = minHeight + 'px';
    } else {
      inputRef.style.height = newHeight + 'px';
    }
  }, []);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      dmMessage.actions.onChange(event.target.value);

      updateInputHeight(event.target);
    },
    [dmMessage.actions, updateInputHeight]
  );

  const to = useMemo(
    () => (isGroup ? Array.from(selectedChat.to).join(', ') : selectedChat.to),
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
        <Avatar
          simple
          size={28}
          avatar={dmModel.metadata.avatar}
          patp={dmModel.to}
          sigilColor={[dmModel.metadata.color || '#000000', 'white']}
        />
      );
    }
  }, [isGroup, selectedChat]);

  const AttachmentIcon = () => {
    if (isUploading) {
      return <Spinner size={0} />;
    } else if (uploadError) {
      return (
        <Tooltip show position="top" content={uploadError} id="upload-error">
          <Icon name="Error" size={22} opacity={0.7} />
        </Tooltip>
      );
    } else {
      return <Icon name="Attachment" size={22} opacity={0.7} />;
    }
  };

  return (
    <>
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Flex justifyContent="center" alignItems="center">
          <Button.IconButton
            className="realm-cursor-hover"
            size={26}
            onClick={(evt: any) => {
              evt.stopPropagation();
              onBack();
            }}
          >
            <Icon name="ArrowLeftLine" size={22} opacity={0.7} />
          </Button.IconButton>
        </Flex>
        <Flex
          ml={2}
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
              <Text.Custom
                fontSize={3}
                fontWeight={500}
                style={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {to}
              </Text.Custom>
            </Tooltip>
            {isGroup && (
              <Text.Custom fontSize={1} fontWeight={400} opacity={0.5}>
                {selectedChat.to.length} people
              </Text.Custom>
            )}
          </Flex>
        </Flex>
      </Flex>
      <Flex width="100%" position="relative" overflowY="auto">
        <ChatLog
          key={`${selectedChat.path}-${selectedChat.lastTimeSent}}-${lastMessage?.index}`}
          loading={loading}
          messages={messages}
          isGroup={isGroup}
        />
      </Flex>
      <ChatInputWrapper
        height={60}
        position="absolute"
        bottom={0}
        left={-12}
        right={-12}
      >
        <Flex flex={1} flexDirection="row" alignItems="center">
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
            <Button.IconButton
              mr={2}
              size={26}
              disabled={!canUpload}
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
            </Button.IconButton>
          </Tooltip>
          <Input
            as="textarea"
            innerRef={chatInputRef}
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
                <Button.IconButton
                  ref={submitRef}
                  size={24}
                  disabled={isSending}
                  onClick={submitDm}
                >
                  {!isSending ? (
                    <Icon opacity={0.5} name="ArrowRightLine" size={22} />
                  ) : (
                    <Spinner size={0} />
                  )}
                </Button.IconButton>
              </Flex>
            }
            onChange={onChange}
            onPaste={onPaste}
            onFocus={() => dmMessage.actions.onFocus()}
            onBlur={() => dmMessage.actions.onBlur()}
            wrapperStyle={{
              height: 'max-content',
              margin: '12px 0',
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
      </ChatInputWrapper>
    </>
  );
});
