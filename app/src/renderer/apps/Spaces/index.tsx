import { useState, useEffect } from 'react';
import {
  Text,
  Flex,
  Button,
  Icon,
  Spinner,
  TextInput,
} from '@holium/design-system';
import { SpacesList } from './SpacesList';
import { YouRow } from './YouRow';
import { observer } from 'mobx-react';
import { isValidPatp } from 'urbit-ob';
import { useTrayApps } from '../store';
import { FeaturedList } from './FeaturedList';
import { useAppState } from 'renderer/stores/app.store';
import { useShipStore } from 'renderer/stores/ship.store';

const bottomHeight = 54;

const SpacesTrayAppPresenter = () => {
  const { shellStore } = useAppState();
  const { ship, spacesStore } = useShipStore();
  const { dimensions } = useTrayApps();
  const [searchString, setSearchString] = useState<string>('');

  const isValidSpace = (space: string) => {
    if (!space.includes('/')) {
      return false;
    }
    const pathArr = space.split('/');
    const ship = pathArr[0];
    const spaceName = pathArr[1];
    return ship.length > 1 && isValidPatp(ship) && spaceName.length > 0;
  };

  const [searchVisible, setSearchVisible] = useState(false);

  useEffect(() => {
    spacesStore.setJoin('initial');
  }, []);
  if (
    spacesStore.join.state === 'loading' &&
    spacesStore.spaces.has('/' + searchString)
  ) {
    spacesStore.selectSpace('/' + searchString);
    if (searchVisible === true) {
      setSearchVisible(false);
    }
    spacesStore.setJoin('loaded');
  }

  return (
    <Flex
      height={dimensions.height - 24}
      flexDirection="column"
      position="relative"
    >
      <Flex
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text.Custom
          fontWeight={500}
          textTransform="uppercase"
          pl={1}
          opacity={0.7}
        >
          Spaces
        </Text.Custom>
        <Flex flexDirection="row" gap={8}>
          <Button.IconButton
            className="realm-cursor-hover"
            width={26}
            height={26}
            onClick={() => {
              spacesStore.setJoin('initial');
              setSearchVisible(!searchVisible);
            }}
          >
            <Icon name="Search" size={20} opacity={0.7} />
          </Button.IconButton>
          <Button.IconButton
            className="realm-cursor-hover"
            data-close-tray="true"
            width={26}
            height={26}
            onClick={() => {
              shellStore.openDialog('create-space-1');
            }}
          >
            <Icon name="Plus" size={24} opacity={0.7} />
          </Button.IconButton>
        </Flex>
      </Flex>
      {searchVisible && spacesStore.join.state !== 'loaded' ? (
        <Flex
          position="absolute"
          flexDirection="column"
          width="100%"
          style={{ bottom: bottomHeight, top: 34, left: 0, right: 0 }}
          overflowY="hidden"
        >
          <Flex position="relative" flexDirection="column">
            <TextInput
              tabIndex={1}
              autoCapitalize="false"
              autoCorrect="false"
              autoComplete="false"
              id="space-input"
              name="space-input"
              height={34}
              placeholder="Enter space path (e.g. ~zod/galaxy-space)"
              onChange={(evt: any) => {
                evt.stopPropagation();
                spacesStore.setJoin('initial');
                setSearchString(evt.target.value);
              }}
              rightAdornment={
                <Button.TextButton
                  disabled={!isValidSpace(searchString)}
                  onClick={() => {
                    spacesStore.setJoin('loading');
                    spacesStore.joinSpace(searchString);
                  }}
                >
                  {spacesStore.join.state === 'loading' ? (
                    <Spinner size={0} />
                  ) : (
                    'Join'
                  )}
                </Button.TextButton>
              }
              onKeyDown={(evt: any) => {
                if (evt.key === 'Enter' && isValidSpace(searchString)) {
                  spacesStore.setJoin('loading');
                  spacesStore.joinSpace(searchString);
                }
              }}
            />
          </Flex>
          <Flex width="100%" justifyContent="flex-end">
            <Text.Custom fontSize="11px" color="intent-alert">
              {spacesStore.join.state === 'error' &&
                `Failed to join ${searchString}.`}
              &nbsp;&nbsp;&nbsp;
            </Text.Custom>
          </Flex>
          <Flex flexDirection="column" width="100%">
            <Text.Custom
              ml={1}
              mt={1}
              fontSize={2}
              opacity={0.7}
              fontWeight={500}
            >
              Featured
            </Text.Custom>
            <Flex
              position="absolute"
              width="100%"
              style={{ bottom: bottomHeight, top: 80, left: 0, right: 0 }}
              overflowY="hidden"
            >
              <FeaturedList />
            </Flex>
          </Flex>
        </Flex>
      ) : (
        <Flex
          position="absolute"
          width="100%"
          style={{ bottom: bottomHeight, top: 34, left: 0, right: 0 }}
          overflowY="hidden"
        >
          <SpacesList
            onFindMore={() => {
              setSearchVisible(true);
            }}
            selected={spacesStore.selected}
            spaces={spacesStore.spacesList}
            onSelect={spacesStore.selectSpace}
          />
        </Flex>
      )}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        mb={1}
        flex={1}
        height={bottomHeight}
      >
        {ship && (
          <YouRow
            selected={`/${ship.patp}/our` === spacesStore.selected?.path}
            space={spacesStore.ourSpace}
            ship={ship}
            onSelect={(path: string) => spacesStore.selectSpace(path)}
          />
        )}
      </Flex>
    </Flex>
  );
};

export const SpacesTrayApp = observer(SpacesTrayAppPresenter);
