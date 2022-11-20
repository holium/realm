import { FC, useMemo, useState } from 'react';
import { Grid, Flex, IconButton, Icons, Text, Input, TextButton } from 'renderer/components';
import { SpacesList } from './SpacesList';
import { YouRow } from './YouRow';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { ShellActions } from 'renderer/logic/actions/shell';
import { rgba, lighten, darken } from 'polished';

interface SpacesProps {
  theme: any;
  dimensions: {
    height: number;
    width: number;
  };
}

export const SpacesTrayApp: FC<SpacesProps> = observer((props: SpacesProps) => {
  const { ship, theme, spaces } = useServices();

  const { dimensions } = props;

  const spaceTheme = useMemo(() => theme.currentTheme, [theme.currentTheme]);
  const { dockColor, iconColor, textColor, windowColor, mode, inputColor } = spaceTheme;
  const [searchString, setSearchString] = useState<string>('');

  const themeInputColor = useMemo(
    () =>
      mode === 'light' ? lighten(0.2, inputColor) : darken(0.005, inputColor),
    [inputColor]
  );

  const backgroundColor = useMemo(
    () =>
      mode === 'light'
        ? lighten(0.025, rgba(dockColor, 0.9))
        : darken(0.05, rgba(dockColor, 0.9)),
    [dockColor]
  );

  const bottomHeight = 58;

  const [coords, setCoords] = useState<{
    left: number;
    bottom: number;
  }>({ left: 0, bottom: 48 });

  const [isVisible, setIsVisible] = useState(true);

  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <Grid.Column
      style={{
        position: 'relative',
        height: dimensions.height,
        background: windowColor,
      }}
      expand
      noGutter
      overflowY="hidden"
    >
      <Grid.Row
        style={{
          position: 'relative',
          zIndex: 5,
          top: 0,
          left: 0,
          right: 0,
          height: 50,
          paddingLeft: 16,
          paddingRight: 16,
        }}
        expand
        noGutter
        justify="space-between"
        align="center"
      >
        <Text
          opacity={0.8}
          color={textColor}
          style={{ textTransform: 'uppercase' }}
          fontWeight={600}
        >
          Spaces
        </Text>
        <Flex>
        <IconButton
          className="realm-cursor-hover"
          style={{ cursor: 'none' }}
          customBg={dockColor}
          size={28}
          color={iconColor}
          data-close-tray="false"
          onClick={(evt: any) => {
            setSearchVisible(!searchVisible);
          }}
          mr={1}
        >
          <Icons name="Search" opacity={0.7} />
        </IconButton>
        <IconButton
          className="realm-cursor-hover"
          style={{ cursor: 'none' }}
          customBg={dockColor}
          size={28}
          color={iconColor}
          data-close-tray="true"
          onClick={(evt: any) => {
            ShellActions.openDialog('create-space-1');
          }}
        >
          <Icons name="Plus" opacity={0.7} />
        </IconButton>
        </Flex>
      </Grid.Row>
      {searchVisible
      ? <Grid.Column>
        <Flex
          mt={5}
          mb={5}
          position="relative"
//          width="100%"
//          style={{ bottom: bottomHeight, top: 50, left: 0, right: 0 }}
//          overflowY="hidden"
        >
        <Input
          tabIndex={1}
          autoCapitalize="false"
          autoCorrect="false"
          autoComplete="false"
          name="person"
          height={34}
          placeholder="Paste link..."
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
            setSearchString(evt.target.value);
          }}
          rightInteractive
          rightIcon={
            <TextButton
//              disabled={!person.computed.parsed}
              onClick={(evt: any) => {
                console.log('search', searchString);
                SpacesActions.joinSpace(searchString);
              }}
            >
              Join
            </TextButton>
          }
          //value={person.state.value}
          /*error={
            person.computed.isDirty && person.computed.ifWasEverBlurredThenError
          }*/
          /*onKeyDown={(evt: any) => {
            if (evt.key === 'Enter' && person.computed.parsed) {
              onShipSelected([person.computed.parsed, '']);
              person.actions.onChange('');
            }
          }}*/
          onFocus={() => {
            //person.actions.onFocus();
          }}
          onBlur={() => {
            //person.actions.onBlur();
          }}
        />
        </Flex>
        <Flex
          position="relative"
          width="100%"
          //style={{ bottom: bottomHeight, top: 50, left: 0, right: 0 }}
          //overflowY="hidden"
        >
          <Text
                opacity={0.8}
                color={textColor}
                fontWeight={450}
              >
                Featured spaces
              </Text>
        </Flex>
              </Grid.Column>
      : <Flex
          position="absolute"
          width="100%"
          style={{ bottom: bottomHeight, top: 50, left: 0, right: 0 }}
          overflowY="hidden"
        >
          <SpacesList
            selected={spaces.selected}
            spaces={spaces.spacesList}
            onSelect={async (path: string) =>
              await SpacesActions.selectSpace(path)
            }
          />
        </Flex>}
      <Grid.Row expand noGutter></Grid.Row>
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        pl={4}
        pr={4}
        mb={2}
        flex={1}
        height={bottomHeight}
      >
        <YouRow
          colorTheme={windowColor}
          selected={`/${ship?.patp}/our` === spaces.selected?.path}
          ship={ship!}
          onSelect={async (path: string) =>
            await SpacesActions.selectSpace(path)
          }
        />
      </Flex>
    </Grid.Column>
  );
});
