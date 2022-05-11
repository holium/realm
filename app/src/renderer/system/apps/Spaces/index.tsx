import { FC, useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';

import { ThemeStoreType } from '../../../logic/theme/store';
import { useMst, useShip } from '../../../logic/store';

import { Grid, Flex, IconButton, Icons, Text } from '../../../components';
import { SpacesList } from './SpacesList';
import { YouRow } from './YouRow';

type SpacesProps = {
  theme: ThemeStoreType;
  dimensions: {
    height: number;
    width: number;
  };
};

export const Spaces: FC<SpacesProps> = (props: SpacesProps) => {
  const { ship } = useShip();
  const { dimensions } = props;

  const spaceTheme = useMemo(() => ship!.theme, [ship!.theme]);
  const { backgroundColor, textColor, dockColor, iconColor } = spaceTheme;

  // const iconColor = darken(0.5, textColor);
  const bgHover = lighten(0.1, backgroundColor);
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
          className="dynamic-mouse-hover"
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
        <SpacesList spaces={[]} />
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
        <YouRow selected={true} ship={ship!} />
      </Flex>
    </Grid.Column>
  );
};
