import { FC } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AnimatedCursor from './Cursor';
import { hexToRgb } from 'renderer/logic/utils/color';
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
  const rgb: any = cursorColor && hexToRgb(cursorColor);
  return useMemo(
    () => (
      <MouseArea
        animate={{ zIndex: 11000, display: hide ? 'none' : 'inherit' }}
      >
        <AnimatedCursor
          animateOut={animateOut}
          innerSize={10}
          outerSize={12}
          trailingSpeed={1}
          color={
            (cursorColor && `${rgb.r}, ${rgb.g}, ${rgb.b}`) || '193, 11, 111'
          }
          outerAlpha={0.2}
          innerScale={0.9}
          outerScale={2}
        />
      </MouseArea>
    ),
    [hide, cursorColor]
  );
};

export default Mouse;
