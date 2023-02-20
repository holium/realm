import { motion } from 'framer-motion';
import { darken } from 'polished';
import styled from 'styled-components';
import { ThemeType } from 'renderer/theme';

type AppWindowStyleProps = {
  theme: ThemeType;
  customBg: string;
};

export const AirliftAgent = styled(motion.div)<AppWindowStyleProps>`
  position: absolute;
  border-radius: 9px;
  overflow: hidden;
  box-sizing: content-box;
  backdrop-filter: blur(24px);
  box-shadow: ${(props) => props.theme.elevations.two};
  border: 1px solid ${(props) => darken(0.1, props.customBg)};
  background-color: ${(props) => props.customBg};
`;

const DragHandle = styled(motion.div)`
  position: absolute;
  height: 10px;
  width: 10px;
`;

export const BottomLeftDragHandle = styled(DragHandle)`
  left: 0px;
  bottom: 0px;
  cursor: sw-resize;
`;

export const BottomRightDragHandle = styled(DragHandle)`
  right: 0px;
  bottom: 0px;
  cursor: se-resize;
`;
