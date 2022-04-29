import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';

import { WindowThemeType } from '../../../../../../logic/stores/config';
import { Grid, Flex, Text } from '../../../../../../components';

type TitlebarProps = {
  theme: Partial<WindowThemeType>;
  app: {
    title: string;
    icon?: string;
    color?: string;
  };
};

export const Titlebar = (props: TitlebarProps) => {
  const { title, icon, color } = props.app;
  const { backgroundColor, textColor } = props.theme;

  const iconColor = darken(0.5, textColor!);
  return (
    <Grid.Row
      style={{
        position: 'absolute',
        zIndex: 5,
        top: 0,
        left: 0,
        right: 0,
        height: 50,
        background: rgba(lighten(0.26, backgroundColor!), 0.9),
        // backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${rgba(backgroundColor!, 0.7)}`,
      }}
      expand
      noGutter
      justify="space-between"
      align="center"
    >
      <Flex pl={3} pr={4} justifyContent="center" alignItems="center">
        {icon && <img height={24} width={24} src={icon} />}
        <Text
          opacity={0.7}
          style={{ textTransform: 'uppercase' }}
          fontWeight={600}
        >
          {title}
        </Text>
      </Flex>
    </Grid.Row>
  );
};
