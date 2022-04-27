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
import { useMst } from '../../..//logic/store';
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

  return (
    <>
      {selectedChat ? (
        <Grid.Column expand noGutter overflowY="hidden">
          <Grid.Row
            style={{ marginTop: 6, marginBottom: 12 }}
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
              <Text fontSize={3} fontWeight={500}>
                {selectedChat.contact}
              </Text>
            </Flex>
            <Flex pl={2} pr={2}>
              <IconButton size={28} color={iconColor}>
                <Icons name="Plus" />
              </IconButton>
              {/* <IconButton size={28}>
            <Icons name="OneThirdLayout" />
          </IconButton> */}
            </Flex>
          </Grid.Row>
          <Flex overflowY="hidden">
            <ChatView
              dimensions={dimensions}
              theme={props.theme}
              contact={selectedChat.contact}
              height={dimensions.height - 61}
              onSend={(message: any) => {
                console.log('dm message', message);
              }}
            />
          </Flex>
        </Grid.Column>
      ) : (
        <Grid.Column expand noGutter overflowY="hidden">
          <Grid.Row
            style={{ marginTop: 6, marginBottom: 12 }}
            expand
            noGutter
            align="center"
          >
            <Flex pl={3} pr={4} justifyContent="center" alignItems="center">
              <Icons name="Messages" size={20} mr={1} />
            </Flex>
            <Flex flex={1}>
              <Input
                placeholder="Search"
                wrapperStyle={{
                  borderRadius: 18,
                  backgroundColor: lighten(0.24, backgroundColor),
                  '&:hover': {
                    borderColor: backgroundColor,
                  },
                  borderColor: rgba(backgroundColor, 0.6),
                }}
              />
            </Flex>
            <Flex pl={2} pr={2}>
              <IconButton size={28} color={iconColor}>
                <Icons name="Plus" />
              </IconButton>
              {/* <IconButton size={28}>
            <Icons name="OneThirdLayout" />
          </IconButton> */}
            </Flex>
          </Grid.Row>
          <Flex overflowY="hidden">
            <DMs
              theme={props.theme}
              height={dimensions.height - 61}
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
