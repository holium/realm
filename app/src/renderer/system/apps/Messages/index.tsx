import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';

import { WindowThemeType } from '../../../logic/stores/config';
import { Grid, Flex, Box, Input, IconButton, Icons } from '../../../components';
import { useMst } from '../../..//logic/store';
import { DMs } from './DMs';

type ChatProps = {
  theme: WindowThemeType;
};

export const Chat: FC<any> = (props: ChatProps) => {
  const { backgroundColor, textColor } = props.theme;
  // const { shipStore } = useMst();
  // useEffect(() => {
  //   shipStore.session?.chat.getDMs();
  // }, []);
  const [selectedChat, setSelectedChat] = useState(null);
  return selectedChat ? (
    <Flex>something</Flex>
  ) : (
    <Grid.Column expand noGutter>
      <Grid.Row style={{ marginTop: 6 }} expand noGutter align="center">
        <Flex pl={3} pr={4} justifyContent="center" alignItems="center">
          <Icons name="Messages" size={20} mr={1} />
        </Flex>
        <Flex flex={1}>
          <Input
            wrapperStyle={{
              borderRadius: 18,
              backgroundColor: lighten(0.2, backgroundColor),
              '&:hover': {
                borderColor: backgroundColor,
              },
              borderColor: rgba(backgroundColor, 0.6),
            }}
          />
        </Flex>
        <Flex pl={4} pr={2}>
          <IconButton size={28} mr={2}>
            <Icons name="Plus" />
          </IconButton>
          <IconButton size={28}>
            <Icons name="OneThirdLayout" />
          </IconButton>
        </Flex>
      </Grid.Row>
      <Grid.Row>
        <DMs />
      </Grid.Row>
    </Grid.Column>
  );
};
