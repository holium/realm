import { FC, useMemo, useState } from 'react';
import { Grid, Flex, IconButton, Icons, Text } from 'renderer/components';
import { SpacesList } from './SpacesList';
import { YouRow } from './YouRow';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store';
import { SpacesActions } from 'renderer/logic/actions/spaces';
import { ShellActions } from 'renderer/logic/actions/shell';

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
  const { dockColor, iconColor, textColor, windowColor } = spaceTheme;

  const bottomHeight = 58;

  const [coords, setCoords] = useState<{
    left: number;
    bottom: number;
  }>({ left: 0, bottom: 48 });

  const [isVisible, setIsVisible] = useState(true);

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
          position: 'absolute',
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
      </Grid.Row>
      <Flex
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
      </Flex>
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
