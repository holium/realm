import { useMemo, useState, useEffect } from 'react';
import { Input } from 'renderer/components';
import { Text, Flex, Button, Icon, Spinner } from '@holium/design-system';
import { SpacesList } from './SpacesList';
import { YouRow } from './YouRow';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { ShellActions } from 'renderer/logic/actions/shell';
import { lighten, darken } from 'polished';
import { isValidPatp } from 'urbit-ob';
import { getBaseTheme } from '../Wallet/lib/helpers';
import { useTrayApps } from '../store';
import { FeaturedList } from './FeaturedList';

const bottomHeight = 54;

const SpacesTrayAppPresenter = () => {
  const { ship, theme, spaces } = useServices();
  const { dimensions } = useTrayApps();
  const themeData = getBaseTheme(theme.currentTheme);
  const spaceTheme = useMemo(() => theme.currentTheme, [theme.currentTheme]);
  const { windowColor, mode, inputColor } = spaceTheme;
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
  const themeInputColor = useMemo(
    () =>
      mode === 'light' ? lighten(0.2, inputColor) : darken(0.005, inputColor),
    [inputColor, mode]
  );

  const [searchVisible, setSearchVisible] = useState(false);

  useEffect(() => {
    SpacesActions.setJoin('initial');
  }, []);
  if (
    spaces.join.state === 'loading' &&
    spaces.spaces.has('/' + searchString)
  ) {
    SpacesActions.selectSpace('/' + searchString);
    if (searchVisible === true) {
      setSearchVisible(false);
    }
    SpacesActions.setJoin('loaded');
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
              SpacesActions.setJoin('initial');
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
              ShellActions.openDialog('create-space-1');
            }}
          >
            <Icon name="Plus" size={24} opacity={0.7} />
          </Button.IconButton>
        </Flex>
      </Flex>
      {searchVisible && spaces.join.state !== 'loaded' ? (
        <Flex
          position="absolute"
          flexDirection="column"
          width="100%"
          style={{ bottom: bottomHeight, top: 34, left: 0, right: 0 }}
          overflowY="hidden"
        >
          <Flex position="relative" flexDirection="column">
            <Input
              tabIndex={1}
              autoCapitalize="false"
              autoCorrect="false"
              autoComplete="false"
              name="person"
              height={34}
              placeholder="Enter space path (e.g. ~zod/galaxy-space)"
              bg={
                mode === 'light'
                  ? lighten(0.2, inputColor)
                  : darken(0.005, inputColor)
              }
              wrapperMotionProps={{
                initial: {
                  backgroundColor: themeInputColor,
                },
                animate: {
                  backgroundColor: themeInputColor,
                },
                transition: {
                  backgroundColor: { duration: 0.3 },
                  borderColor: { duration: 0.3 },
                  color: { duration: 0.5 },
                },
              }}
              wrapperStyle={{
                borderRadius: 6,
                paddingRight: 4,
              }}
              onChange={(evt: any) => {
                evt.stopPropagation();
                SpacesActions.setJoin('initial');
                setSearchString(evt.target.value);
              }}
              rightInteractive
              rightIcon={
                <Button.TextButton
                  disabled={!isValidSpace(searchString)}
                  onClick={() => {
                    SpacesActions.setJoin('loading');
                    SpacesActions.joinSpace(searchString);
                  }}
                >
                  {spaces.join.state === 'loading' ? (
                    <Spinner size={0} />
                  ) : (
                    'Join'
                  )}
                </Button.TextButton>
              }
              onKeyDown={(evt: any) => {
                if (evt.key === 'Enter' && isValidSpace(searchString)) {
                  SpacesActions.setJoin('loading');
                  SpacesActions.joinSpace(searchString);
                }
              }}
            />
          </Flex>
          <Flex width="100%" justifyContent="flex-end">
            <Text.Custom fontSize="11px" color={themeData.colors.text.error}>
              {spaces.join.state === 'error' &&
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
            selected={spaces.selected}
            spaces={spaces.spacesList}
            onSelect={SpacesActions.selectSpace}
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
            colorTheme={windowColor}
            selected={`/${ship.patp}/our` === spaces.selected?.path}
            ship={ship}
            onSelect={SpacesActions.selectSpace}
          />
        )}
      </Flex>
    </Flex>
  );
};

export const SpacesTrayApp = observer(SpacesTrayAppPresenter);
