import { motion } from 'framer-motion';
import styled from 'styled-components';

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
