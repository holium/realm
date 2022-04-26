/* Mainbar */
import { FC, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { rgba, lighten } from 'polished';
import styled from 'styled-components';

import { ThemeType } from '../../../../../../theme';

type MiniAppStyleProps = {
  theme: ThemeType;
  customBg?: string;
};

export const MiniAppWindow = styled(styled(motion.div)<MiniAppStyleProps>`
  border-radius: 6px;
  backdrop-filter: blur(12px);
  width: 270px; 
  padding: 8px;
  box-shadow: ${(props: MiniAppStyleProps) => props.theme.elevations.one}
  min-height: 300px;
`)<MiniAppStyleProps>({
  // @ts-expect-error annoying
  // backgroundColor: (props: SystemBarStyleProps) =>
  //   props.customBg ? rgba(props.customBg!, 0.8) : 'initial',
  backgroundColor: (props: SystemBarStyleProps) =>
    props.customBg ? rgba(lighten(0.15, props.customBg!), 0.8) : 'initial',
});

type MiniAppProps = {
  id: string;
  ref?: any;
  onClose?: () => void;
  backgroundColor?: string;
  dimensions: {
    height: number;
    width: number;
  };
  textColor?: string;
  buttonRef?: any;
  children?: React.ReactNode;
};

const DEFAULT_PROPS = {
  onClose: () => {},
  dimensions: {
    height: 350,
    width: 290,
  },
};

export const MiniApp: FC<MiniAppProps> = forwardRef(
  (props: MiniAppProps, ref: any) => {
    const { id, dimensions, backgroundColor, textColor, onClose, children } =
      props;

    return (
      <MiniAppWindow
        id={id}
        ref={ref}
        style={{ height: dimensions.height, width: dimensions.width }}
        color={textColor}
        // variants={menuAnimate}
        customBg={backgroundColor}
      >
        {children}
      </MiniAppWindow>
    );
  }
);

MiniApp.defaultProps = DEFAULT_PROPS;

// mport { FC, useEffect, useRef, useState } from 'react';
// import { AnimatePresence, motion } from 'framer-motion';
// import ReactDOM from 'react-dom';
// import { rgba } from 'polished';
// import styled from 'styled-components';

// import { ThemeType } from '../../../../../../theme';
// import Portal from '../../../../../modals/Portal';
// import { calculateAnchorPoint } from '../../../../../../logic/utils/anchor-point';
// import { number } from 'yup';

// type MiniAppStyleProps = {
//   theme: ThemeType;
//   customBg?: string;
// };

// export const MiniAppWindow = styled(styled(motion.div)<MiniAppStyleProps>`
//   border-radius: 6px;
//   backdrop-filter: blur(12px);
//   width: 270px; /** a mobile width */
//   box-shadow: ${(props: MiniAppStyleProps) => props.theme.elevations.one}
//   min-height: 300px;
// `)<MiniAppStyleProps>({
//   // @ts-expect-error annoying
//   backgroundColor: (props: SystemBarStyleProps) =>
//     props.customBg ? rgba(props.customBg!, 0.8) : 'initial',
// });

// type MiniAppProps = {
//   id: string;
//   isOpen: boolean;
//   onClose: () => void;
//   backgroundColor?: string;
//   dimensions: {
//     height: number;
//     width: number;
//   };
//   textColor?: string;
//   buttonRef?: any;
//   children?: React.ReactNode;
// };

// const DEFAULT_PROPS = {
//   id: 'window-id',
//   isOpen: false,
//   onClose: () => {},
//   dimensions: {
//     height: 350,
//     width: 290,
//   },
// };

// export const MiniApp: FC<MiniAppProps> = (
//   props: MiniAppProps = DEFAULT_PROPS
// ) => {
//   const miniAppRef = useRef(null);
//   const [anchorPoint, setAnchorPoint] = useState<{ x: number; y: number }>();
//   const {
//     id,
//     buttonRef,
//     isOpen,
//     backgroundColor,
//     textColor,
//     onClose,
//     dimensions,
//     children,
//   } = props;
//   console.log(isOpen);
//   const menuAnimate = {
//     enter: {
//       y: -8,
//       opacity: 1,
//       width: dimensions.width,
//       height: dimensions.height,
//       transition: {
//         opacity: 0.2,
//         duration: 0.2,
//       },
//     },
//     exit: {
//       y: 0,
//       x: 0,
//       opacity: 0,
//       height: 40,
//       width: 130,
//       transition: {
//         opacity: 0.2,
//         duration: 0.2,
//       },
//     },
//   };

//   const handleClickOutside = (event: any) => {
//     const domNode = ReactDOM.findDOMNode(miniAppRef.current);
//     const buttonNode = ReactDOM.findDOMNode(buttonRef.current);
//     // event.stopPropagation();
//     if (buttonNode?.contains(event.target)) {
//       setAnchorPoint(
//         calculateAnchorPoint(
//           event,
//           'top-left',
//           0,
//           dimensions.width,
//           dimensions.height
//         )
//       );
//     } else {
//       if (!domNode || !domNode.contains(event.target)) {
//         if (isOpen) {
//           // event.preventDefault();
//           onClose();
//         }
//       } else {
//         console.log('clicked inside');
//       }
//     }
//   };

//   useEffect(() => {
//     document.addEventListener('click', handleClickOutside, true);
//     return () => {
//       document.removeEventListener('click', handleClickOutside, true);
//     };
//   }, [isOpen]);
//   console.log(anchorPoint, isOpen);

//   return isOpen ? (
//     <Portal>
//       <AnimatePresence>
//         <MiniAppWindow

//           style={{
//             position: 'absolute',
//             right: anchorPoint && anchorPoint.x + 12,
//             bottom: anchorPoint && anchorPoint.y + 12,
//             // padding: '8px 4px',
//           }}
//           ref={miniAppRef}
//           key="profile-menu"
//           initial="exit"
//           animate="enter"
//           exit="exit"
//           color={textColor}
//           variants={menuAnimate}
//           customBg={backgroundColor}
//         >
//           {children}
//         </MiniAppWindow>
//       </AnimatePresence>
//     </Portal>
//   ) : null;
// };

// MiniApp.defaultProps = DEFAULT_PROPS;
