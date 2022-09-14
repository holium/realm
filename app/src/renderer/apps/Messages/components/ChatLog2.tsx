import { useRef, useEffect, useState, useCallback, useMemo, FC } from 'react';
import { Virtuoso } from 'react-virtuoso';

import usePrevious from '../helpers/usePrevious';
import { ChatMessage } from './ChatMessage';

import { GraphDMType } from 'os/services/ship/models/courier';
import { useServices } from 'renderer/logic/store';

const START_INDEX = 0;
const PAGE_SIZE = 10;

const savedMessages = {};

const randomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

interface ChatLogProps {
  loading: boolean;
  isGroup: boolean;
  messages: GraphDMType[];
}

export const ChatLog2: FC<ChatLogProps> = ({
  messages,
  isGroup,
}: ChatLogProps) => {
  const ref = useRef(null);
  const { ship, desktop } = useServices();
  // START_INDEX starting value is the max value, makes figuring out the index in the messages array easier
  const [firstItemIndex, setFirstItemIndex] = useState(
    START_INDEX - messages.length
  );

  console.log('MessagesList: Starting firstItemIndex', firstItemIndex);
  console.log('MessagesList: Starting messages length', messages.length);

  // keep a copy of messages so I can set the next first item index before new messages set
  const internalMessages = useMemo(() => {
    const nextFirstItemIndex = START_INDEX - messages.length;
    setFirstItemIndex(nextFirstItemIndex);
    return messages;
  }, [messages]);

  const itemContent = useCallback(
    (index: number, message: GraphDMType) => (
      <ChatMessage
        isSending={message.pending}
        showAuthor={isGroup}
        key={`${message.index}-${message.timeSent}-${index}`}
        theme={desktop.theme}
        our={ship!.patp}
        ourColor={ship!.color || '#569BE2'}
        message={message}
      />
    ),
    []
  );

  // setting 'auto' for behavior does help in this sample, but not in my actual code
  const followOutput = useCallback((isAtBottom) => {
    console.log('MessagesList: followOutput isAtBottom', isAtBottom);
    return isAtBottom ? 'smooth' : false;
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column',
        height: '100vh',
        width: '350px',
      }}
    >
      <Virtuoso
        ref={ref}
        initialTopMostItemIndex={internalMessages.length - 1}
        firstItemIndex={Math.max(0, firstItemIndex)}
        itemContent={itemContent}
        data={internalMessages}
        // startReached={startReached}
        followOutput={followOutput}
        style={{ flex: '1 1 auto', overscrollBehavior: 'contain' }}
      />
      <div style={{ flex: '0 1 40px' }}></div>
    </div>
  );
};
