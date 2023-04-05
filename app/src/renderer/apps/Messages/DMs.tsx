import { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import {
  Icon,
  Text,
  Button,
  Flex,
  Box,
  TextInput,
  Skeleton,
  Spinner,
  WindowedList,
} from '@holium/design-system';
import { ContactRow } from './components/ContactRow';
import { ThemeModelType } from 'os/services/theme.model';
import { useServices } from 'renderer/logic/store';
import {
  PreviewDMType,
  PreviewGroupDMType,
  DMPreviewType,
} from 'os/services/ship/models/courier';
import { ShipActions } from 'renderer/logic/actions/ship';

interface IProps {
  theme: ThemeModelType;
  headerOffset: number;
  height: number;
  onSelectDm: (dm: any) => void;
  onNewChat: (evt: any) => void;
}

const DMsPresenter = (props: IProps) => {
  const { height, theme, onSelectDm, onNewChat } = props;

  const { courier } = useServices();
  const [searchString, setSearchString] = useState<string>('');
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const previews = Array.from(courier.previews.values())
    .sort((a, b) => b.lastTimeSent - a.lastTimeSent)
    .filter(Boolean);
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
          <Text.Custom width={200} textAlign="center" opacity={0.3}>
            No Direct Messages. Click the <b>+</b> to start.
          </Text.Custom>
        </Flex>
      );
    }

    return (
      <WindowedList
        key={lastTimeSent}
        width={364}
        height={544}
        data={previews.filter(searchFilter)}
        itemContent={(index, dm) => (
          <Box
            display="block"
            key={`dm-${index}-${dm.lastTimeSent}-${dm.pending}`}
          >
            <ContactRow
              theme={theme}
              dm={dm}
              refreshDms={fetchPreviews}
              onClick={(evt) => {
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
    <>
      <Flex
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Flex justifyContent="center" alignItems="center">
          <Icon opacity={0.8} name="Messages" size={24} mr={3} />
          <Text.Custom fontWeight={600} textTransform="uppercase" opacity={0.7}>
            DMs
          </Text.Custom>
        </Flex>
        <Flex flex={1} ml={3} mr={2}>
          <TextInput
            id="dm-search"
            name="dm-search"
            type="text"
            height={30}
            width="100%"
            placeholder="Search"
            onChange={(evt: any) => {
              evt.stopPropagation();
              setSearchString(evt.target.value);
            }}
          />
        </Flex>
        <Flex>
          <Button.IconButton
            className="realm-cursor-hover"
            width={26}
            height={26}
            onClick={onNewChat}
          >
            <Icon name="Plus" size={24} opacity={0.7} />
          </Button.IconButton>
        </Flex>
      </Flex>
      <Flex gap={2} flexDirection="column" height={height} overflowY="auto">
        {courier.loader.isLoading ? (
          <Flex flex={1} alignItems="center" justifyContent="center">
            <Spinner size={2} />
          </Flex>
        ) : (
          <>
            <Box display="block" />
            <DMList />
            <Box display="block" />
          </>
        )}
      </Flex>
    </>
  );
};

export const DMs = observer(DMsPresenter);
