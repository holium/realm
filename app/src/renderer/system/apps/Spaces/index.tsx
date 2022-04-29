import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';

import { WindowThemeType } from '../../../logic/stores/config';
import { useMst } from '../../../logic/store';

import { Grid, Flex, IconButton, Icons, Text } from '../../../components';
import { SpacesList } from './SpacesList';
import { YouRow } from './YouRow';

type ProfileProps = {
  theme: WindowThemeType;
  dimensions: {
    height: number;
    width: number;
  };
};

export const Spaces: FC<ProfileProps> = (props: ProfileProps) => {
  const { shipStore } = useMst();
  const { dimensions } = props;
  const { backgroundColor, textColor } = props.theme;

  const iconColor = darken(0.5, textColor);
  const bgHover = lighten(0.1, backgroundColor);
  const bottomHeight = 54;

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
          // background: rgba(lighten(0.2, backgroundColor), 0.9),
          // backdropFilter: 'blur(8px)',
          // borderBottom: `1px solid ${rgba(backgroundColor, 0.7)}`,
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
        <IconButton size={28} color={iconColor}>
          <Icons name="Plus" />
        </IconButton>
      </Grid.Row>
      <Flex
        position="absolute"
        pl={12}
        pr={12}
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
        height={bottomHeight}
      >
        <Flex pl={12} pr={12}>
          <YouRow ship={shipStore.session!} />
        </Flex>
      </Flex>
    </Grid.Column>
  );
};
