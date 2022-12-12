import { useCallback, useMemo, useState } from 'react';
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
import { ThemeModelType } from 'os/services/theme.model';
import { Titlebar } from 'renderer/system/desktop/components/Window/Titlebar';
import { darken, lighten } from 'polished';
import { useServices } from 'renderer/logic/store';
import {
  PreviewDMType,
  PreviewGroupDMType,
  DMPreviewType,
} from 'os/services/ship/models/courier';
import { WindowedList } from '@holium/design-system';

interface IProps {
  theme: ThemeModelType;
  headerOffset: number;
  height: number;
  onSelectDm: (dm: any) => void;
  onNewChat: (evt: any) => void;
}

export const DMs = observer((props: IProps) => {
  const { height, headerOffset, theme, onSelectDm, onNewChat } = props;
  const { textColor, iconColor, dockColor, windowColor } = theme;

  const { courier } = useServices();
  const [searchString, setSearchString] = useState<string>('');

  const previews = useMemo(() => {
    return Array.from(courier.previews.values()).sort(
      (a, b) => b.lastTimeSent - a.lastTimeSent
    );
  }, [courier.previews]);

  const searchFilter = useCallback(
    (preview: DMPreviewType) => {
      if (!searchString || searchString.trim() === '') return true;
      let to: string;
      if (preview.type === 'group' || preview.type === 'group-pending') {
        const dm = preview as PreviewGroupDMType;
        to = Array.from(dm.to).join(', ');
      } else {
        const dm = preview as PreviewDMType;
        to = dm.to;
      }
      return to.indexOf(searchString) === 0;
    },
    [searchString]
  );

  const dMList = useCallback(() => {
    if (previews.length === 0) {
      return (
        <Flex
          flex={1}
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={24}
        >
          <Text color={textColor} width={200} textAlign="center" opacity={0.3}>
            No Direct Messages. Click the <b>+</b> to start.
          </Text>
        </Flex>
      );
    }

    const lastMessageText = previews[0].lastMessage[0]?.text;

    return (
      <WindowedList
        key={lastMessageText}
        width={388}
        height={528}
        rowHeight={57}
        data={previews}
        filter={searchFilter}
        rowRenderer={(dm, index) => (
          <Box display="block" key={`${lastMessageText}-${index}`}>
            <ContactRow
              theme={theme}
              dm={dm}
              onClick={(evt: any) => {
                evt.stopPropagation();
                onSelectDm(dm);
              }}
            />
          </Box>
        )}
      />
    );
  }, [onSelectDm, previews, searchFilter, textColor, theme]);

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
            onChange={(evt: any) => {
              evt.stopPropagation();
              setSearchString(evt.target.value);
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
              {dMList()}
            </>
          )}
        </Grid.Column>
      </Flex>
    </Grid.Column>
  );
});
