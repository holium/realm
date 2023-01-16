import { useCallback, useEffect, useState } from 'react';
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
import { darken, rgba, lighten } from 'polished';
import { useServices } from 'renderer/logic/store';
import {
  PreviewDMType,
  PreviewGroupDMType,
  DMPreviewType,
} from 'os/services/ship/models/courier';
import { Skeleton, WindowedList } from '@holium/design-system';
import { ShipActions } from 'renderer/logic/actions/ship';

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
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const previews = Array.from(courier.previews.values()).sort(
    (a, b) => b.lastTimeSent - a.lastTimeSent
  );
  const lastTimeSent = previews[0]?.lastTimeSent;

  const fetchPreviews = useCallback(async () => {
    const newPreviews = await ShipActions.getDMs();
    courier.setPreviews(newPreviews);
  }, [courier]);

  useEffect(() => {
    const fetchPreviewsWithSkeleton = async () => {
      setIsFetching(true);
      await fetchPreviews();
      setIsFetching(false);
    };

    if (previews.length === 0) fetchPreviewsWithSkeleton();
  }, []);

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

  const DMList = () => {
    if (isFetching) {
      return (
        <Flex
          flex={1}
          flexDirection="column"
          justifyContent="start"
          overflow="hidden"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <Box key={index} mb={2} mx={4}>
              <Skeleton height={57} borderRadius={8} />
            </Box>
          ))}
        </Flex>
      );
    }

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

    return (
      <WindowedList
        key={lastTimeSent}
        width={388}
        height={544}
        rowHeight={57}
        data={previews}
        filter={searchFilter}
        rowRenderer={(dm, index) => (
          <Box
            display="block"
            key={`dm-${index}-${dm.lastTimeSent}-${dm.pending}`}
          >
            <ContactRow
              theme={theme}
              dm={dm}
              refreshDms={fetchPreviews}
              onClick={(evt: any) => {
                evt.stopPropagation();
                onSelectDm(dm);
              }}
            />
          </Box>
        )}
      />
    );
  };

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
                  : rgba(darken(0.075, windowColor), 0.5),
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
        }}
        overflowY="hidden"
      >
        <Grid.Column gap={2} noGutter expand height={height} overflowY="auto">
          {courier.loader.isLoading ? (
            <Flex flex={1} alignItems="center" justifyContent="center">
              <Spinner size={2} />
            </Flex>
          ) : (
            <>
              <Box display="block" style={{ minHeight: headerOffset + 4 }} />
              <DMList />
            </>
          )}
        </Grid.Column>
      </Flex>
    </Grid.Column>
  );
});
