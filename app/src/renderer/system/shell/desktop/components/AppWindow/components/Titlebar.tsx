import styled, { css } from 'styled-components';
import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { rgba, lighten, darken } from 'polished';

import { WindowThemeType } from '../../../../../../logic/stores/config';
import { Grid, Flex, Text } from '../../../../../../components';

type TitlebarStyleProps = {
  customBg: string;
  hasBorder: boolean;
  zIndex: number;
};

const TitlebarStyle = styled(Grid.Row)<TitlebarStyleProps>`
  position: absolute;
  z-ndex: 5;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  backdrop-filter: blur(8px);
  --webkit-transform: translate3d(0, 0, 0);
  ${(props: TitlebarStyleProps) => css`
    background: ${rgba(lighten(0.225, props.customBg!), 0.9)};
    z-index: ${props.zIndex};
    border-bottom: ${props.hasBorder
      ? `1px solid ${rgba(props.customBg!, 0.7)}`
      : 'none'};
  `}
`;

type TitlebarProps = {
  theme: Partial<WindowThemeType>;
  zIndex: number;
  hasBorder?: boolean;
  app?: {
    title?: string;
    icon?: string;
    color?: string;
  };
  children?: React.ReactNode;
};

export const Titlebar = (props: TitlebarProps) => {
  const { children, hasBorder, zIndex } = props;
  const { windowColor } = props.theme;

  let titleSection: any;
  if (props.app) {
    const { title, icon, color } = props.app!;
    titleSection = (
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
    );
  }

  return (
    <TitlebarStyle
      expand
      noGutter
      align="center"
      justify="space-between"
      zIndex={zIndex}
      customBg={windowColor!}
      hasBorder={hasBorder!}
    >
      {titleSection}
      {children}
    </TitlebarStyle>
  );
};

Titlebar.defaultProps = {
  zIndex: 2,
  hasBorder: true,
};
