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

type ChatProps = {
  theme: WindowThemeType;
  dimensions: {
    height: number;
    width: number;
  };
};

export const Chat: FC<any> = (props: ChatProps) => {
  const { dimensions } = props;
  const { backgroundColor, textColor } = props.theme;

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
          <Grid.Row
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
          >
            <Flex pl={3} pr={4} justifyContent="center" alignItems="center">
              <IconButton
                onClick={(evt: any) => {
                  evt.stopPropagation();
                  setSelectedChat(null);
                }}
              >
                <Icons name="ArrowLeftLine" size={20} mr={1} />
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
              <Text opacity={0.7} fontSize={3} fontWeight={500}>
                {selectedChat.contact}
              </Text>
            </Flex>
            <Flex pl={2} pr={2} mr={3}>
              <IconButton size={26} color={iconColor}>
                <Icons name="Phone" />
              </IconButton>
              {/* <IconButton size={28} color={iconColor}>
                <Icons name="More" />
              </IconButton> */}
              {/* <IconButton size={28}>
            <Icons name="OneThirdLayout" />
          </IconButton> */}
            </Flex>
          </Grid.Row>
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
        <Grid.Column
          style={{ position: 'relative' }}
          expand
          noGutter
          overflowY="hidden"
        >
          <Grid.Row
            style={{
              position: 'absolute',
              zIndex: 5,
              top: 0,
              left: 0,
              right: 0,
              height: headerSize,
              background: rgba(lighten(0.22, backgroundColor), 0.9),
              backdropFilter: 'blur(8px)',
              borderBottom: `1px solid ${rgba(backgroundColor, 0.7)}`,
            }}
            expand
            noGutter
            align="center"
          >
            <Flex
              pl={3}
              pr={4}
              mr={3}
              justifyContent="center"
              alignItems="center"
            >
              <Icons opacity={0.8} name="Messages" size={24} mr={2} />
              <Text
                opacity={0.7}
                style={{ textTransform: 'uppercase' }}
                fontWeight={600}
              >
                DMs
              </Text>
            </Flex>
            {/* <Flex
              ml={2}
              pl={3}
              pr={4}
              justifyContent="center"
              alignItems="center"
            >
              <Icons name="Messages" size={20} mr={1} />
            </Flex> */}
            <Flex flex={1}>
              <Input
                placeholder="Search"
                wrapperStyle={{
                  borderRadius: 18,
                  backgroundColor: lighten(0.3, backgroundColor),
                  '&:hover': {
                    borderColor: backgroundColor,
                  },
                  borderColor: rgba(backgroundColor, 0.7),
                }}
              />
            </Flex>
            <Flex mr={2} pl={2} pr={2}>
              <IconButton size={28} color={iconColor}>
                <Icons name="Plus" />
              </IconButton>
              {/* <IconButton size={28}>
            <Icons name="OneThirdLayout" />
          </IconButton> */}
            </Flex>
          </Grid.Row>
          <Flex
            style={{
              zIndex: 4,
              position: 'relative',
              bottom: 0,
              left: 0,
              right: 0,
            }}
            pl={1}
            pr={1}
            mb={headerSize}
            overflowY="hidden"
          >
            <DMs
              theme={props.theme}
              headerOffset={headerSize}
              height={dimensions.height}
              onSelectDm={(dm: any) => {
                setSelectedChat(dm);
                console.log('selecting dm', dm);
              }}
            />
          </Flex>
        </Grid.Column>
      )}
    </>
  );
};
