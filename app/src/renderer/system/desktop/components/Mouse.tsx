import { FC } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AnimatedCursor from './Cursor';
import { hexToRgb } from 'renderer/logic/utils/color';

export const MouseArea = styled(motion.div)`
  cursor: none;
`;

interface MouseProps {
  cursorColor?: string | null;
  animateOut?: boolean;
  hide?: boolean;
}

export const Mouse: FC<MouseProps> = (props: MouseProps) => {
  const { cursorColor, hide, animateOut } = props;

  const rgb: any = cursorColor && hexToRgb(cursorColor);
  return (
    <MouseArea animate={{ zIndex: 1100, display: hide ? 'none' : 'inherit' }}>
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
        clickables={[
          'a',
          'label[for]',
          'select',
          'textarea',
          'button',
          'li',
          '.link',
          '.app-dock-icon',
          '.realm-cursor-hover',
        ]}
      />
    </MouseArea>
  );
};

export default Mouse;
