import { FC, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AnimatedCursor, { CurrentUserCursor, Vec2 } from './Cursor';
import { hexToRgb, rgbToString } from 'renderer/logic-old/utils/color';
import { useMemo } from 'react';
import { Presences } from './Presences';

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
export { Presences };
