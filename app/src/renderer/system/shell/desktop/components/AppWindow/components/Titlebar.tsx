import styled, { css } from 'styled-components';
import { FC, useEffect, useState } from 'react';
import { rgba, lighten, darken } from 'polished';

import { WindowThemeType } from '../../../../../../logic/stores/config';
import {
  Grid,
  Flex,
  Text,
  IconButton,
  Icons,
} from '../../../../../../components';
import { useMst } from 'renderer/logic/store';

type TitlebarStyleProps = {
  customBg: string;
  hasBorder: boolean;
  zIndex: number;
};

const TitlebarStyle = styled(Grid.Row)<TitlebarStyleProps>`
  // position: absolute;
  z-index: 5;
  top: 0;
  left: 0;
  right: 0;
  height: 30px;
  padding: 0 4px 0 12px;
  --webkit-transform: translate3d(0, 0, 0);
  ${(props: TitlebarStyleProps) => css`
    background: ${rgba(props.customBg, 0.5)};
    z-index: ${props.zIndex};
    border-bottom: ${props.hasBorder
      ? `1px solid ${rgba(darken(0.06, props.customBg), 0.9)}`
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
  const { windowColor, iconColor, dockColor } = props.theme;
  const { desktopStore } = useMst();

  const onClose = () => {
    desktopStore.activeApp
      ? desktopStore.closeApp(desktopStore.activeApp?.id)
      : {};
  };

  let titleSection: any;
  if (props.app) {
    const { title, icon, color } = props.app!;
    titleSection = (
      <Flex pr={4} justifyContent="center" alignItems="center">
        {icon && <img height={24} width={24} src={icon} />}
        <Text
          opacity={0.7}
          style={{ textTransform: 'uppercase' }}
          fontSize={2}
          fontWeight={500}
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
      <Flex gap={4} alignItems="center">
        {/* <IconButton
          size={20}
          customBg={windowColor}
          // hoverFill="#FF6240"
          onClick={() => {}}
        >
          <Icons name="ArrowLeftLine" color={iconColor} />
        </IconButton>
        <IconButton size={20} customBg={windowColor} onClick={() => {}}>
          <Icons name="ArrowRightLine" color={iconColor} />
        </IconButton> */}
        {titleSection}
      </Flex>

      {children}
      <Flex alignItems="center">
        <IconButton
          customBg="#FF6240"
          hoverFill="#FF6240"
          onClick={() => onClose()}
        >
          <Icons name="Close" />
        </IconButton>
      </Flex>
    </TitlebarStyle>
  );
};

Titlebar.defaultProps = {
  zIndex: 2,
  hasBorder: true,
};
