import { motion } from 'framer-motion';
import styled from 'styled-components';

export const AppWindowContainer = styled(motion.div)`
  position: absolute;
  border-radius: 9px;
  overflow: hidden;
  box-sizing: content-box;
  backdrop-filter: blur(24px);
  box-shadow: var(--rlm-box-shadow-2);
  border: 1px solid rgba(var(--rlm-border-rgba));
  background-color: rgba(var(--rlm-window-bg-rgba));
`;

const DragHandle = styled(motion.div)<{ zIndex: number }>`
  position: absolute;
  height: 10px;
  width: 10px;
  z-index: ${(props) => props.zIndex};
`;

export const TopLeftDragHandle = styled(DragHandle)`
  left: 0px;
  top: 0px;
  cursor: nw-resize;
`;

export const TopRightDragHandle = styled(DragHandle)`
  right: 0px;
  top: 0px;
  cursor: ne-resize;
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
