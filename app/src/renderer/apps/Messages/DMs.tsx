import { FC, useMemo } from 'react';
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
} from 'renderer/components';
import { ContactRow } from './components/ContactRow';
import { toJS } from 'mobx';
import { WindowThemeType } from 'renderer/logic-old/stores/config';
import { Titlebar } from 'renderer/system/desktop/components/AppWindow/Titlebar';
import { darken, lighten, rgba } from 'polished';
import { useServices } from 'renderer/logic/store-2';

type IProps = {
  theme: WindowThemeType;
  headerOffset: number;
  height: number;
  onSelectDm: (dm: any) => void;
  onNewChat: (evt: any) => void;
};

export const DMs: FC<IProps> = observer((props: IProps) => {
  const { height, headerOffset, theme, onSelectDm, onNewChat } = props;
  const { ship } = useServices();
  const { backgroundColor, textColor, iconColor, dockColor } = theme;
  const windowColor = useMemo(
    () => rgba(lighten(0.225, props.theme.windowColor), 0.8),
    [props.theme.windowColor]
  );

  const chat = ship!.chat;
  return (
    <Grid.Column
      style={{ position: 'relative', color: textColor }}
      expand
      noGutter
      overflowY="hidden"
    >
      <Titlebar
        hasBlur
        hasBorder
        zIndex={5}
        theme={{
          ...props.theme,
          windowColor,
        }}
      >
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
            className="realm-cursor-text-cursor"
            type="text"
            placeholder="Search"
            wrapperStyle={{
              cursor: 'none',
              borderRadius: 9,
              backgroundColor: darken(0.05, windowColor),
              '&:hover': {
                borderColor: backgroundColor,
              },
              borderColor: rgba(backgroundColor, 0.7),
            }}
          />
        </Flex>
        <Flex ml={1} pl={2} pr={2}>
          <IconButton
            customBg={dockColor}
            className="realm-cursor-hover"
            size={28}
            color={iconColor}
            onClick={onNewChat}
          >
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
          backgroundColor: windowColor,
        }}
        mb={headerOffset}
        overflowY="hidden"
      >
        <Grid.Column
          gap={2}
          mt={1}
          mb={3}
          pb={4}
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
