import { motion } from 'framer-motion';
import styled from 'styled-components';

type Props = {
  height: number;
  width: number;
  src: string;
  borderRadius: number;
};

export const ImageCrest = styled(motion.div)<Props>`
  border-radius: ${(p) => p.borderRadius}px;
  background-image: url(${(props) => props.src});
  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;
