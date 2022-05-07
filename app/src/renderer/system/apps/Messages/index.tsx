import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';

import { WindowThemeType } from '../../../logic/stores/config';
import {
  Grid,
  Flex,
  Box,
  Input,
  IconButton,
  Icons,
  Sigil,
  Text,
} from '../../../components';
import { useMst } from '../../../logic/store';
import { DMs } from './DMs';
import { ChatView } from './ChatView';
import { Titlebar } from '../../shell/desktop/components/AppWindow/components/Titlebar';

type ChatProps = {
  theme: WindowThemeType;
  dimensions: {
    height: number;
    width: number;
  };
};

export const Chat: FC<any> = (props: ChatProps) => {
  const { dimensions } = props;
  const { backgroundColor, textColor, dockColor } = props.theme;

  const [selectedChat, setSelectedChat] = useState<any>(null);
  const iconColor = darken(0.5, textColor);

  const headerSize = 50;

  return (
    <>
      {selectedChat ? (
        <Grid.Column
          style={{ position: 'relative' }}
          expand
          noGutter
          overflowY="hidden"
        >
          {/* <Grid.Row
            style={{
              position: 'absolute',
              zIndex: 5,
              top: 0,
              left: 0,
              right: 0,
              height: headerSize,
              background: rgba(lighten(0.23, backgroundColor), 0.9),
              backdropFilter: 'blur(8px)',
              borderBottom: `1px solid ${rgba(backgroundColor, 0.7)}`,
            }}
            expand
            noGutter
            align="center"
          > */}
          <Titlebar
            closeButton={false}
            hasBorder
            zIndex={5}
            theme={props.theme}
          >
            <Flex pl={3} pr={4} justifyContent="center" alignItems="center">
              <IconButton
                size={26}
                customBg={dockColor}
                onClick={(evt: any) => {
                  evt.stopPropagation();
                  setSelectedChat(null);
                }}
              >
                <Icons name="ArrowLeftLine" />
              </IconButton>
            </Flex>
            <Flex flex={1} gap={10} alignItems="center" flexDirection="row">
              <Box>
                <Sigil
                  simple
                  size={28}
                  avatar={null}
                  patp={selectedChat.contact}
                  color={['#000000', 'white']}
                />
              </Box>
              <Text fontSize={3} fontWeight={500}>
                {selectedChat.contact}
              </Text>
            </Flex>
            <Flex pl={2} pr={2} mr={3}>
              <IconButton customBg={dockColor} size={26} color={iconColor}>
                <Icons name="Phone" />
              </IconButton>
            </Flex>
          </Titlebar>
          <Flex
            style={{
              zIndex: 4,
              position: 'relative',
              bottom: 0,
              left: 0,
              right: 0,
            }}
            overflowY="hidden"
          >
            <ChatView
              headerOffset={headerSize}
              dimensions={dimensions}
              theme={props.theme}
              contact={selectedChat.contact}
              height={dimensions.height}
              onSend={(message: any) => {
                console.log('dm message', message);
              }}
            />
          </Flex>
        </Grid.Column>
      ) : (
        <DMs
          theme={props.theme}
          headerOffset={headerSize}
          height={dimensions.height}
          onSelectDm={(dm: any) => {
            setSelectedChat(dm);
          }}
        />
      )}
    </>
  );
};
