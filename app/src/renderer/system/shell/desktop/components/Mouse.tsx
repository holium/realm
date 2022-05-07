import { FC, useRef, useCallback, useState } from 'react';
import styled from 'styled-components';
import useMouse from '@react-hook/mouse-position';
import { motion } from 'framer-motion';
import AnimatedCursor from 'react-animated-cursor';

const MouseArea = styled.div`
  cursor: none;
`;
const MouseStyle = styled(motion.div)`
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background-color: #1e91d6;
`;

export const Mouse: FC<any> = (props: any) => {
  const ref: any = useRef(null);
  // const mouse = useMouse(ref);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const onMouseMove = useCallback((e: any) => {
    const { left, top } = ref.current.getBoundingClientRect();
    const newX = e.clientX - left;
    const newY = e.clientY - top;

    setMousePosition({ x: newX, y: newY });
  }, []);
  return (
    <MouseArea>
      <AnimatedCursor
        innerSize={8}
        outerSize={8}
        color="193, 11, 111"
        outerAlpha={0.2}
        innerScale={0.7}
        outerScale={5}
        clickables={[
          'a',
          'input[type="text"]',
          'input[type="email"]',
          'input[type="number"]',
          'input[type="submit"]',
          'input[type="image"]',
          'label[for]',
          'select',
          'textarea',
          'button',
          '.link',
        ]}
      />
    </MouseArea>
    // <MouseArea ref={ref} onMouseMove={onMouseMove}>
    //   <MouseStyle
    //     // animate={{}}
    //     transition={{
    //       type: 'just',
    //       // stiffness: 1000,
    //       // damping: 100,
    //     }}
    //     // style={{ x: mousePosition.x, y: mousePosition.y }}
    //     variants={{
    //       default: {
    //         x: mousePosition.x,
    //         y: mousePosition.y,
    //         // translateX: hoveringIcon ? -30 : -16,
    //         // translateY: hoveringIcon ? -30 : -16,
    //         // rotateX,
    //         // rotateY,
    //         // scaleX,
    //         // scaleY,
    //       },
    //     }}
    //     animate={'default'}
    //   ></MouseStyle>
    // </MouseArea>
  );
};
