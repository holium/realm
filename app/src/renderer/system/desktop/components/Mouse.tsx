import { FC } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CurrentUserCursor } from './Cursor';
import { hexToRgb, rgbToString } from 'renderer/logic/utils/color';
import { useMemo } from 'react';

export const MouseArea = styled(motion.div)`
  cursor: none;
`;
interface MouseProps {
  hide?: boolean;
  cursorColor: string;
  animateOut?: boolean;
}

export const Mouse: FC<MouseProps> = (props: MouseProps) => {
  const { animateOut, cursorColor, hide } = props;
  const rgb = cursorColor && rgbToString(hexToRgb(cursorColor));
  return useMemo(
    () => (
      <MouseArea
        animate={{ zIndex: 11000, display: hide ? 'none' : 'inherit' }}
      >
        <CurrentUserCursor animateOut={animateOut} color={rgb || undefined} />
      </MouseArea>
    ),
    [hide, cursorColor]
  );
};

export default Mouse;
