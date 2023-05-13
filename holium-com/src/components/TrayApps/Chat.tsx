import { useEffect, useState } from 'react';

import {
  Box,
  Flex,
  Icon,
  Text,
  WindowedList,
} from '@holium/design-system/general';
import { TrayApp } from '@holium/design-system/os';
import { BubbleSkeleton } from '@holium/design-system/src/blocks/Bubble/BubbleSkeleton';
import { ChatInputSkeleton } from '@holium/design-system/src/blocks/ChatInput/ChatInputSkeleton';
import { chatDate } from '@holium/design-system/util';

import { messages, spaces } from '../../spaces';
import { useSpace } from '../SpaceContext';

type ChatAppProps = {
  isOpen: boolean;
  coords: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  closeTray: () => void;
};

const position = 'top-left';
const anchorOffset = { x: -8, y: 24 };
const dimensions = { height: 600, width: 400 };

export const chatConfig = {
  position,
  anchorOffset,
  dimensions,
};

export const ChatApp = ({
  isOpen = false,
  closeTray,
  coords,
}: ChatAppProps) => {
  const { space } = useSpace();
  const [chats, setChats] = useState(messages[space]);

  useEffect(() => {
    setChats(messages[space]);
  }, [space]);

  return (
    <TrayApp
      id="chat"
      className="hideonmobile"
      isOpen={isOpen}
      coords={coords}
      closeTray={closeTray}
    >
      <Flex gap={12} flexDirection="column">
        <Flex ml={1} flexDirection="row" alignItems="center">
          <Flex width={26}>
            <Icon name="Messages" size={24} opacity={0.8} />
          </Flex>
          <Flex flex={1} ml={2} pr={2} alignItems="center">
            <Text.Custom fontWeight={500}>{spaces[space].title}</Text.Custom>
          </Flex>
        </Flex>
        <Box height={500} width="inherit" overflow="hidden">
          <WindowedList
            chatMode
            height={490}
            data={chats}
            itemContent={(index, row) => {
              return (
                <Box
                  pt={2}
                  pb={index === chats.length - 1 ? 2 : 0}
                  width="100%"
                  style={{ pointerEvents: 'none' }}
                >
                  <BubbleSkeleton
                    id={`chat-${index}`}
                    isOur={row.author === '~lomder-librun'}
                    author={row.author}
                    authorColor={row.authorColor}
                    fragmentBlock={row.message.map((fragment) => {
                      if (fragment.image) {
                        return <img src={fragment.image} alt="" />;
                      }

                      return <Text.Body>{fragment.plain}</Text.Body>;
                    })}
                    dateDisplay={chatDate(new Date(row.sentAt))}
                    footerHeight="14px"
                  />
                </Box>
              );
            }}
          />
        </Box>
        <Box position="absolute" bottom={12} left={12} right={12}>
          <ChatInputSkeleton />
        </Box>
      </Flex>
    </TrayApp>
  );
};
