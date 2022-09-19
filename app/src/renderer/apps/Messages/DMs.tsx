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
import { ThemeModelType } from 'os/services/theme.model';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { darken, lighten, rgba } from 'polished';
import { useServices } from 'renderer/logic/store';

type IProps = {
  theme: ThemeModelType;
  headerOffset: number;
  height: number;
  onSelectDm: (dm: any) => void;
  onNewChat: (evt: any) => void;
};

export const DMs: FC<IProps> = observer((props: IProps) => {
  const { height, headerOffset, theme, onSelectDm, onNewChat } = props;
  const { courier } = useServices();
  const { textColor, iconColor, dockColor, windowColor, mode } = theme;
  const previews = useMemo(() => {
    return Array.from(courier.previews.values()).sort((a, b) => {
      // @ts-ignore
      return b.pending - a.pending || b.lastTimeSent - a.lastTimeSent;
    });
  }, [courier.previews]);
  return (
    <Grid.Column
      style={{ position: 'relative', color: textColor }}
      expand
      noGutter
      overflowY="hidden"
    >
      <Titlebar
        hasBlur
        hasBorder={false}
        zIndex={5}
        theme={{
          ...props.theme,
          // windowColor: rgba(lighten(0.125, windowColor), 0.8),
          // windowColor: rgba(windowColor, 0.8),
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
              borderColor: 'transparent',
              backgroundColor:
                theme.mode === 'dark'
                  ? lighten(0.1, windowColor)
                  : darken(0.055, windowColor),
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
          mb={3}
          pb={4}
          noGutter
          expand
          height={height}
          overflowY="auto"
        >
          {courier.loader.isLoading ? (
            <Flex flex={1} alignItems="center" justifyContent="center">
              <Spinner size={2} />
            </Flex>
          ) : (
            <>
              <Box display="block" style={{ minHeight: headerOffset + 4 }} />
              {previews.length === 0 && (
                <Flex
                  flex={1}
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  gap={24}
                >
                  {/* <Text
                    color={textColor}
                    width={200}
                    textAlign="center"
                    opacity={0.6}
                  >
                    No DMs
                  </Text> */}
                  <Text
                    color={textColor}
                    width={200}
                    textAlign="center"
                    opacity={0.3}
                  >
                    No Direct Messages. Click the <b>+</b> to start.
                  </Text>
                </Flex>
              )}
              {previews.map((dm: any, index: number) => (
                <Box display="block" key={`${dm.to}-${index}`}>
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
