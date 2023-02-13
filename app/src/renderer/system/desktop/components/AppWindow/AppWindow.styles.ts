import { motion } from 'framer-motion';
import { darken } from 'polished';
import styled from 'styled-components';
import { ThemeType } from '../../../../theme';

type AppWindowStyleProps = {
  theme: ThemeType;
  customBg: string;
};

export const AppWindowContainer = styled(motion.div)<AppWindowStyleProps>`
  position: absolute;
  border-radius: 9px;
  overflow: hidden;
  box-sizing: content-box;
  backdrop-filter: blur(24px);
  box-shadow: ${(props) => props.theme.elevations.two};
  border: 1px solid ${(props) => darken(0.1, props.customBg)};
  background-color: ${(props) => props.customBg};
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
