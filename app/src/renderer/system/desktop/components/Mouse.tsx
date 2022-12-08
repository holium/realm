import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CurrentUserCursor } from './Cursor';
import { hexToRgb, rgbToString } from 'os/lib/color';

export const MouseArea = styled(motion.div)`
  cursor: none;
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
    [hide, initialRender, animateOut, rgb]
  );
};

export default Mouse;
