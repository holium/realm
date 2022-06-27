import { FC, useMemo, useState } from 'react';
import { toJS } from 'mobx';
import { rgba, lighten, darken } from 'polished';

import { Grid, Flex, IconButton, Icons, Text } from 'renderer/components';
import { SpacesList } from './SpacesList';
import { YouRow } from './YouRow';
import { observer } from 'mobx-react';
import { useServices } from 'renderer/logic/store-2';

type SpacesProps = {
  theme: any;
  dimensions: {
    height: number;
    width: number;
  };
};

export const Spaces: FC<SpacesProps> = observer((props: SpacesProps) => {
  const { ship, shell, spaces } = useServices();
  const { themeStore } = shell;

  const { dimensions } = props;

  const spaceTheme = useMemo(() => themeStore.theme, [themeStore.theme]);
  const { backgroundColor, textColor, dockColor, iconColor } = spaceTheme;
  // console.log(toJS(spacesStore.spacesList));
  // const iconColor = darken(0.5, textColor);
  const bottomHeight = 58;

  return (
    <Grid.Column
      style={{ position: 'relative', height: dimensions.height }}
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
        >
          <Icons name="Plus" />
        </IconButton>
      </Grid.Row>
      <Flex
        position="absolute"
        width="100%"
        style={{ bottom: bottomHeight, top: 50, left: 0, right: 0 }}
        overflowY="hidden"
      >
        {/* <SpacesList
          selected={spacesStore.selected}
          spaces={spacesStore.spacesList}
          onSelect={spacesStore.selectSpace}
        /> */}
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
        {/* <YouRow
          selected={ship?.patp === spacesStore.selected?.id}
          ship={ship!}
          onSelect={spacesStore.selectSpace}
        /> */}
      </Flex>
    </Grid.Column>
  );
});
