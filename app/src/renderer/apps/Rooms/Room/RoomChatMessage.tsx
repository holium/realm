import { ChatModelType } from 'os/services/tray/rooms.model';
import { lighten } from 'polished';
import { FC, useEffect, useState } from 'react';
import { Bubble } from 'renderer/apps/Messages/components/Bubble';
import { Flex, Text, Tooltip } from 'renderer/components';
import { useServices } from 'renderer/logic/store';




interface RoomChatMessageProps {
    chat : ChatModelType,
    doesPack : boolean,
}

export const RoomChatMessage: FC<RoomChatMessageProps> = ({
  chat,
  doesPack,
}: RoomChatMessageProps) => {

  const { desktop, ship } = useServices();
  const theme = desktop.theme;

  const [ timeString, setTimeString ] = useState('');

  useEffect( () => {
    let dat = new Date(chat.timeReceived);
    let hor = `${dat.getHours()}`.padStart(2, '0');
    let min = `${dat.getMinutes()}`.padStart(2, '0');
    let sec = `${dat.getSeconds()}`.padStart(2, '0');

    setTimeString(`${hor}:${min}:${sec}`);
  }, [chat])
  
  return (
    <Flex
    key={chat.index}
    flexDirection="column"
    justifyContent="flex-end"
    mt={doesPack ? 1 : 4}
    mr={3}
    >
      {( !(chat.isRightAligned) && !(doesPack) ) &&
        // author string
        <Text
        color={theme.textColor}
        fontSize={1}
        >
            {chat.author}
        </Text>
      }

      
      <Flex justifyContent={chat.isRightAligned ? "flex-end" : "flex-start"}>
        <Tooltip
          placement="top"
          content={timeString}
          id={`${chat.index}`}
          >
            <Bubble 
            primary={chat.isRightAligned}
            customBg={chat.isRightAligned ? desktop.theme!.accentColor : lighten(0.1, desktop.theme!.windowColor)}
            >
                <Text
                color={theme.textColor}
                fontSize={2}
                >
                {`${chat.contents}`}
                </Text>

            </Bubble>
          </Tooltip>
      </Flex>
      
    </Flex>
  );
};
