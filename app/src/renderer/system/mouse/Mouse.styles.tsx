import { motion } from 'framer-motion';
import styled from 'styled-components';
import { bgIsLightOrDark } from 'os/lib/color';
import { Position } from '@holium/shared';

export const CursorLabel = styled(motion.div)<{
  position: Position;
  color: string;
  children: string;
}>`
  position: absolute;
  top: ${(props) => props.position.y}px;
  left: ${(props) => props.position.x}px;
  color: ${(props) => bgIsLightOrDark(props.color) === 'dark' && 'white'};
  background-color: ${(props) => `rgba(${props.color}, 0.5)`};
  border-radius: 6px;
  padding: 2px 4px;
  pointer-events: none;
  font-family: 'Rubik', sans-serif;
`;

export const EphemeralChat = styled(motion.div)<{
  position: Position;
  color: string;
}>`
  position: absolute;
  top: ${({ position }) => position.y}px;
  left: ${({ position }) => position.x}px;
  padding: 16px;
  border-radius: 0 999px 999px 999px;
  color: ${({ color }) =>
    bgIsLightOrDark(color) === 'dark' ? 'white' : 'black'};
  background-color: ${({ color }) => `rgba(${color}, 0.5)`};
  border: 1px solid ${({ color }) => `rgba(${color}, 0.5)`};
  font-family: 'Rubik', sans-serif;
`;
