import { FC } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AnimatedCursor, { CurrentUserCursor, Vec2 } from './Cursor';
import { hexToRgb, rgbToString } from 'os/lib/color';
import { useMemo } from 'react';

export const MouseArea = styled(motion.div)`
  cursor: none;
  width: 100vw;
  height: 100vh;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
`;
interface MouseProps {
  hide?: boolean;
  initialRender?: boolean;
  cursorColor: string;
  animateOut?: boolean;
}

export const Mouse: FC<MouseProps> = (props: MouseProps) => {
  const { animateOut, cursorColor, hide, initialRender } = props;
  const rgb = cursorColor && rgbToString(hexToRgb(cursorColor));
  return useMemo(
    () => (
      <MouseArea
        animate={{ zIndex: 2147483648, display: hide ? 'none' : 'inherit' }} // to be higher than one zIndex that I saw in action
      >
        <CurrentUserCursor
          initialRender={initialRender}
          animateOut={animateOut}
          color={rgb || undefined}
        />
      </MouseArea>
    ),
    [hide, cursorColor]
  );
};

export default Mouse;
