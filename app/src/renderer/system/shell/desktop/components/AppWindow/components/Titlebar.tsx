import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
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
  isAppWindow?: boolean;
};

const TitlebarStyle = styled(motion.div)<TitlebarStyleProps>`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  position: ${(props: TitlebarStyleProps) =>
    props.isAppWindow ? 'relative' : 'absolute'};
  top: 0;
  left: 0;
  right: 0;
  height: ${(props: TitlebarStyleProps) => (props.isAppWindow ? 30 : 50)}px;
  padding: 0 4px 0
    ${(props: TitlebarStyleProps) => (props.isAppWindow ? 12 : 0)}px;
  --webkit-transform: translate3d(0, 0, 0);
  transform: translateZ(0);
  will-change: transform;
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
  dragControls?: any;
  isAppWindow?: boolean;
  closeButton?: boolean;
  app?: {
    title?: string;
    icon?: string;
    color?: string;
  };
  children?: React.ReactNode;
};

export const Titlebar = (props: TitlebarProps) => {
  const {
    children,
    closeButton,
    hasBorder,
    zIndex,
    isAppWindow,
    dragControls,
  } = props;
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
      <Flex gap={4} alignItems="center">
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
      </Flex>
    );
  }

  return (
    <TitlebarStyle
      // expand
      // noGutter
      {...(dragControls
        ? {
            onPointerDown: (e) => {
              dragControls.start(e);
            },
            whileTap: { cursor: 'grabbing' },
          }
        : {})}
      zIndex={zIndex}
      customBg={windowColor!}
      hasBorder={hasBorder!}
      isAppWindow={isAppWindow}
    >
      {/* <Flex gap={4} alignItems="center"> */}
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
      {/* </Flex> */}

      {children}
      {closeButton && (
        <Flex alignItems="center">
          <IconButton
            customBg="#FF6240"
            hoverFill="#FF6240"
            onClick={() => onClose()}
          >
            <Icons name="Close" />
          </IconButton>
        </Flex>
      )}
    </TitlebarStyle>
  );
};

Titlebar.defaultProps = {
  zIndex: 2,
  hasBorder: true,
};
