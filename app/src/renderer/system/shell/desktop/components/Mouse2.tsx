import React, { FC, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MouseArea } from './Mouse';
const icons = [
  {
    iconClass: 'fa-facebook-f',
    cursorStyle: 'fb',
  },
  {
    iconClass: 'fa-instagram',
    cursorStyle: 'insta',
  },
  {
    iconClass: 'fa-twitter',
    cursorStyle: 'twitter',
  },
];
interface MouseProps {
  cursorColor?: string | null;
  hide?: boolean;
}
export const Mouse2: FC<MouseProps> = (props: MouseProps) => {
  const { hide, cursorColor } = props;
  //if user is hovering an icon, cursor locks at it
  const [hoveringIcon, setHoveringIcon] = useState(false);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [[rotateX, rotateY, scaleX, scaleY], setMovementAnimation] = useState([
    0, 0, 1, 1,
  ]);
  const containerRef = useRef(null);
  const iconRefs = useRef(new Array());
  const onMouseMove = (e: any) => {
    if (hoveringIcon) return;

    // @ts-ignore
    const { left, top } = containerRef!.current!.getBoundingClientRect();
    const newX = e.clientX - left;
    const newY = e.clientY - top;
    const absDeltaX = Math.abs(mousePosition.x - newX);
    const absDeltaY = Math.abs(mousePosition.y - newY);
    setMovementAnimation([
      absDeltaX * 0.5,
      absDeltaY * 0.5,
      1 - absDeltaY * 0.005,
      1 - absDeltaX * 0.005,
    ]);
    setMousePosition({ x: newX, y: newY });
  };
  const hoverIcon = (iconRef: any, cursorStyle: any) => {
    const { left, top } = iconRef.getBoundingClientRect();
    const { left: leftContainer, top: topContainer } =
      // @ts-ignore
      containerRef.current.getBoundingClientRect();

    setHoveringIcon(cursorStyle);
    // setRotate([0, 0]);
    setMousePosition({
      x: left - leftContainer + 24,
      y: top - topContainer + 24,
    });
  };
  return (
    <MouseArea
      ref={containerRef}
      onMouseMove={onMouseMove}
      style={{
        display: hide ? 'none' : 'inherit',
        position: 'relative',
        height: '100vh',
        width: '100%',
        // visibility: hide ? 'hidden' : 'visible',
        zIndex: 10,
      }}
    >
      <React.Fragment>
        <motion.div
          className={`cursor ${hoveringIcon ? hoveringIcon : ''}`}
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
          }}
          animate={{
            translateX: hoveringIcon ? -30 : -16,
            translateY: hoveringIcon ? -30 : -16,
            rotateX,
            rotateY,
            scaleX,
            scaleY,
          }}
        />
        <div className="icons-wrapper">
          {icons.map(({ cursorStyle, iconClass }, i) => (
            <span
              key={i}
              ref={(el) => iconRefs.current.push(el)}
              onMouseEnter={() => hoverIcon(iconRefs.current[i], cursorStyle)}
              onMouseLeave={() => setHoveringIcon(false)}
            >
              <i className={`fab ${iconClass}`} />
            </span>
          ))}
        </div>
      </React.Fragment>
    </MouseArea>
  );
};
