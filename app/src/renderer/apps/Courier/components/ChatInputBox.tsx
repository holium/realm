import { Box, ChatInput } from '@holium/design-system';
import { useState } from 'react';
import { ChatMessageType } from '../models';

type CourierInputProps = {
  replyTo?: ChatMessageType;
  editMessage?: ChatMessageType | null;
  onCancelEdit?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
  onSend: (fragments: any[]) => void;
  onEditConfirm: (fragments: any[]) => void;
};

export const ChatInputBox = ({
  replyTo,
  editMessage,
  onEditConfirm,
  onCancelEdit,
  onSend,
}: CourierInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <Box
      width="100%"
      height={replyTo ? 60 : 40}
      initial={{
        opacity: 0,
      }}
      animate={{ opacity: 1 }}
      transition={{
        delay: 0.2,
        duration: 0.1,
      }}
      onAnimationComplete={() => {
        setIsFocused(true);
      }}
    >
      <ChatInput
        id="chat-log-input"
        isFocused={isFocused}
        onSend={onSend}
        onAttachment={() => {}}
        editingMessage={editMessage?.contents}
        onEditConfirm={onEditConfirm}
        onCancelEdit={onCancelEdit}
      />
    </Box>
  );
};
