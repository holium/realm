import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Favicon = styled(motion.img)`
  height: 14px;
  width: 14px;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;
`;

Favicon.defaultProps = {
  draggable: false,
};
