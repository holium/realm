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

import { ThemeType } from '../../../../../theme';

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
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 6px;
`)<SystemBarStyleProps>(
  {
    // @ts-expect-error annoying
    backgroundColor: (props: SystemBarStyleProps) =>
      props.customBg ? rgba(props.customBg!, 0.55) : 'initial',
  },
  compose(space, layout, flexbox, border, position, color, backgroundColor)
);
