import { FC, useState } from 'react';
import { observer } from 'mobx-react';
import {
  Grid,
  Flex,
  Box,
  Spinner,
  Text,
  Input,
  Icons,
  IconButton,
} from '../../../components';
import { ContactRow } from './components/ContactRow';
import { useShip } from '../../../logic/store';
import { toJS } from 'mobx';
import { WindowThemeType } from '../../../logic/stores/config';
import { Titlebar } from '../../shell/desktop/components/AppWindow/components/Titlebar';
import { rgba } from 'polished';

type IProps = {
  theme: WindowThemeType;
  headerOffset: number;
  height: number;
  onSelectDm: (dm: any) => void;
};

export const DMs: FC<IProps> = observer((props: IProps) => {
  const { height, headerOffset, theme, onSelectDm } = props;
  const { ship } = useShip();
  const { backgroundColor, windowColor, iconColor, dockColor } = theme;

  const chat = ship!.chat;
  return (
    <Grid.Column
      style={{ position: 'relative' }}
      expand
      noGutter
      overflowY="hidden"
    >
      <Titlebar hasBorder zIndex={5} theme={props.theme}>
        <Flex pl={3} pr={4} mr={2} justifyContent="center" alignItems="center">
          <Icons opacity={0.8} name="Messages" size={24} mr={2} />
          <Text
            opacity={0.8}
            style={{ textTransform: 'uppercase' }}
            fontWeight={600}
          >
            DMs
          </Text>
        </Flex>
        <Flex flex={1}>
          <Input
            placeholder="Search"
            wrapperStyle={{
              borderRadius: 18,
              backgroundColor: rgba(backgroundColor, 0.2),
              '&:hover': {
                borderColor: backgroundColor,
              },
              borderColor: rgba(backgroundColor, 0.7),
            }}
          />
        </Flex>
        <Flex ml={2} mr={2} pl={2} pr={2}>
          <IconButton customBg={dockColor} size={28} color={iconColor}>
            <Icons name="Plus" />
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
        mb={headerOffset}
        overflowY="hidden"
      >
        <Grid.Column
          gap={2}
          mt={1}
          mb={3}
          noGutter
          expand
          height={height}
          overflowY="scroll"
        >
          {chat.loader.isLoading ? (
            <Flex flex={1} alignItems="center" justifyContent="center">
              <Spinner size={2} />
            </Flex>
          ) : (
            <>
              <Box display="block" style={{ minHeight: headerOffset + 4 }} />
              {chat!.list.map((dm: any) => (
                <Box ml={1} mr={1} display="block" key={dm.contact}>
                  <ContactRow
                    theme={theme}
                    dm={dm}
                    onClick={(evt: any) => {
                      evt.stopPropagation();
                      onSelectDm(dm);
                    }}
                  />
                </Box>
              ))}
            </>
          )}
        </Grid.Column>
      </Flex>
    </Grid.Column>
  );
});
