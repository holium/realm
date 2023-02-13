import { motion } from 'framer-motion';
import { darken } from 'polished';
import styled from 'styled-components';
import { ThemeType } from '../../../../theme';

type AppWindowStyleProps = {
  theme: ThemeType;
  customBg?: string;
};

export const AppWindowContainer = styled(motion.div)<AppWindowStyleProps>`
  position: absolute;
  border-radius: 9px;
  overflow: hidden;
  box-sizing: content-box;
  transform: transale3d(0, 0, 0);
  box-shadow: ${(props: AppWindowStyleProps) => props.theme.elevations.two};
  border: 1px solid
    ${(props: AppWindowStyleProps) => darken(0.1, props.customBg!)};
`;

export const LeftDragHandle = styled(motion.div)`
  position: absolute;
  left: 0px;
  bottom: 0px;
  height: 10px;
  width: 10px;
  cursor: sw-resize;
`;

export const RightDragHandle = styled(motion.div)`
  position: absolute;
  right: 0px;
  bottom: 0px;
  height: 10px;
  width: 10px;
  cursor: se-resize;
`;
