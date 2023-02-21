import { Box, ChatInput } from '@holium/design-system';

type CourierInputProps = {
  onSend: (fragments: any[]) => void;
};

export const ChatInputBox = ({ onSend }: CourierInputProps) => {
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
        document.getElementById('chat-send')?.focus();
      }}
    >
      <ChatInput id="chat-send" onSend={onSend} onAttachment={() => {}} />
    </Box>
  );
};
