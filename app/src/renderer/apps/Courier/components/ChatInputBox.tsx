import { Box, ChatInput } from '@holium/design-system';
import { useState } from 'react';

type CourierInputProps = {
  onSend: (fragments: any[]) => void;
};

export const ChatInputBox = ({ onSend }: CourierInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <Box
      width="100%"
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
      />
    </Box>
  );
};
