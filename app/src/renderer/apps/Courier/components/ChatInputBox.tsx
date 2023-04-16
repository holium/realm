import {
  useState,
  useCallback,
  ClipboardEvent,
  useRef,
  useEffect,
} from 'react';
import { Box, ChatInput } from '@holium/design-system';
import { ChatMessageType, ChatModelType } from '../models';
import { useFileUpload } from 'renderer/lib/useFileUpload';
import { IuseStorage } from 'renderer/lib/useStorage';
import { ShipIPC } from 'renderer/stores/ipc';
import { FileUploadParams } from 'os/services/ship/ship.service';

type CourierInputProps = {
  replyTo?: any;
  storage: IuseStorage;
  selectedChat: ChatModelType;
  editMessage?: ChatMessageType | null;
  containerWidth: number;
  themeMode: 'light' | 'dark';
  onSend: (fragments: any[]) => void;
  onAttachmentChange: (attachmentCount: number) => void;
  onCancelEdit?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
  onEditConfirm: (fragments: any[]) => void;
};

export const ChatInputBox = ({
  replyTo,
  storage,
  selectedChat,
  editMessage,
  containerWidth,
  themeMode,
  onSend,
  onEditConfirm,
  onCancelEdit,
  onAttachmentChange,
}: CourierInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();

  const [attachments, setAttachment] = useState<string[]>([]);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (replyTo) {
      setIsFocused(true);
    }
  }, [replyTo]);

  const { canUpload, promptUpload } = useFileUpload({ storage });
  useEffect(() => {
    // send attachment count to parent
    onAttachmentChange(attachments.length);
  }, [attachments]);

  const uploadFile = useCallback(
    (params: FileUploadParams) => {
      setIsUploading(true);
      setUploadError('');
      (ShipIPC.uploadFile(params) as Promise<any>)
        .then((url) => {
          console.log(url);
          setAttachment([...attachments, url]);
        })
        .catch(() => {
          setUploadError('Failed upload, please try again.');
        })
        .finally(() => setIsUploading(false));
    },
    [attachments]
  );

  const onAttachment = () => {
    if (!mediaRef.current) return;
    promptUpload(mediaRef.current)
      .then((file: File) => {
        const params: FileUploadParams = {
          source: 'file',
          content: file.path,
          contentType: file.type,
        };
        uploadFile(params);
      })
      .catch((e) => console.error(e));
  };

  const onPaste = useCallback(
    async (evt: ClipboardEvent<HTMLTextAreaElement>) => {
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

  return (
    <Box
      initial={{
        opacity: 0,
      }}
      animate={{ opacity: 1 }}
      transition={{
        delay: 0.2,
        duration: 0.1,
      }}
      width={containerWidth}
      onAnimationComplete={() => {
        setIsFocused(true);
      }}
    >
      <div ref={mediaRef} style={{ display: 'none' }}></div>
      <ChatInput
        id="chat-log-input"
        selectedChatPath={selectedChat.path}
        replyTo={replyTo}
        isFocused={isFocused}
        loading={isUploading}
        containerWidth={containerWidth}
        onSend={(fragments) => {
          onSend(fragments);
          // clear attachments
          setAttachment([]);
        }}
        themeMode={themeMode}
        attachments={attachments}
        onAttachment={onAttachment}
        onRemoveAttachment={(index: number) => {
          const newAttachments = [...attachments];
          newAttachments.splice(index, 1);
          setAttachment(newAttachments);
        }}
        error={uploadError}
        onPaste={onPaste}
        editingMessage={editMessage?.contents}
        onEditConfirm={onEditConfirm}
        onCancelEdit={onCancelEdit}
        onCancelReply={() => selectedChat.clearReplying()}
        onBlur={() => setIsFocused(false)}
      />
    </Box>
  );
};
