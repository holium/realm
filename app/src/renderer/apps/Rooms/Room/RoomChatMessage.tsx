import { observer } from 'mobx-react';
import { ChatModelType } from '@holium/realm-room';
import { lighten, darken } from 'polished';
import { useEffect, useState } from 'react';
import { Bubble } from 'renderer/apps/Messages/components/Bubble';
import { Flex, Tooltip } from '@holium/design-system';
import { Text } from 'renderer/components';
import { useServices } from 'renderer/logic/store';

interface RoomChatMessageProps {
  chat: ChatModelType;
  doesPack: boolean;
}

const RoomChatMessagePresenter = ({ chat, doesPack }: RoomChatMessageProps) => {
  const { theme: themeStore } = useServices();
  const theme = themeStore.currentTheme;

  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const dat = new Date(chat.timeReceived);
    const hor = `${dat.getHours()}`.padStart(2, '0');
    const min = `${dat.getMinutes()}`.padStart(2, '0');
    const sec = `${dat.getSeconds()}`.padStart(2, '0');

    setTimeString(`${hor}:${min}:${sec}`);
  }, [chat]);

  return (
    <Flex
      key={chat.index}
      flexDirection="column"
      justifyContent="flex-end"
      pt={doesPack ? 1 : 4}
      pl={3}
      pr={3}
    >
      {!chat.isRightAligned && !doesPack && (
        // author string
        <Text color={theme.textColor} fontSize={1}>
          {chat.author}
        </Text>
      )}

      <Flex justifyContent={chat.isRightAligned ? 'flex-end' : 'flex-start'}>
        <Tooltip placement="top" content={timeString} id={`${chat.index}`}>
          <Bubble
            primary={chat.isRightAligned}
            color={chat.isRightAligned ? '#FFF' : theme.textColor}
            customBg={
              chat.isRightAligned
                ? theme.accentColor
                : theme.mode === 'light'
                ? darken(0.1, theme.windowColor)
                : lighten(0.1, theme.windowColor)
            }
          >
            <Text
              fontSize={2}
              style={{
                maxWidth: '200px',
              }}
            >
              {`${chat.content}`}
            </Text>
          </Bubble>
        </Tooltip>
      </Flex>
    </Flex>
  );
};

export const RoomChatMessage = observer(RoomChatMessagePresenter);
