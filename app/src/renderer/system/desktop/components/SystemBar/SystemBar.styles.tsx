import styled, { css } from 'styled-components';
import { rgba } from 'polished';
import { motion } from 'framer-motion';
import {
  compose,
  space,
  layout,
  flexbox,
  border,
  position,
  color,
  backgroundColor,
  SpaceProps,
  LayoutProps,
  FlexboxProps,
  BorderProps,
  PositionProps,
  ColorProps,
  BackgroundColorProps,
} from 'styled-system';

import { ThemeType } from '../../../../theme';

type SystemBarStyleProps = {
  theme: ThemeType;
  customBg?: string;
} & SpaceProps &
  LayoutProps &
  FlexboxProps &
  BorderProps &
  PositionProps &
  ColorProps &
  BackgroundColorProps;

export const SystemBarStyle = styled(styled(motion.div)<SystemBarStyleProps>`
  position: relative;
  z-index: 3;
  height: 42px;
  backdrop-filter: var(--blur-enabled);
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 6px;
  /* transform: translateZ(0); */
  -webkit-backface-visibility: hidden;
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-perspective: 1000;
  backface-visibility: hidden;
  perspective: 1000;
  transform: translate3d(0, 0, 0);
  transition: ${(props: any) => props.theme.transition};
`)<SystemBarStyleProps>(
  {},
  compose(space, layout, flexbox, border, position, color, backgroundColor)
);
