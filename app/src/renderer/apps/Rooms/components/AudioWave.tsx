import { getVar } from '@holium/design-system';
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  Variants,
} from 'framer-motion';
import { SVGProps, useEffect, useState } from 'react';
import {
  WidthProps,
  HeightProps,
  SpaceProps,
  ColorProps,
  LayoutProps,
  TypographyProps,
} from 'styled-system';

export type IconProps = SVGProps<SVGSVGElement> &
  SpaceProps &
  ColorProps &
  LayoutProps &
  TypographyProps &
  WidthProps &
  HeightProps & { transitionDuration: number };

const lines = [
  {
    path: 'M76 77V43',
    delay: 0.3,
  },
  {
    path: 'M92 69L92 51',
    delay: 0.2,
  },
  {
    path: 'M28 69L28 51',
    delay: 0.1,
  },
  {
    path: 'M60 92V28',
    delay: 0.2,
  },
  {
    path: 'M44 77V43',
    delay: 0.3,
  },
];

type AudioWaveProps = {
  speaking?: boolean;
};

export const AudioWave = ({ speaking }: AudioWaveProps) => {

  const controls = useAnimationControls();
  const [show, setShow] = useState(false);

  const defaultStrokeColor = getVar('accent') || '#4e9efd';
  const variants: Variants = {
    speaking: (delay: number) => ({
      stroke: defaultStrokeColor,
      scaleY: 1,
      y: 0,
      transition: {
        repeat: Infinity,
        repeatType: 'reverse',
        delay: delay,
        duration: 0.3,
      },
    }),
    hushed: {
      stroke: '#9ecaff',
      y: 0,
      scaleY: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  useEffect(() => {
    // delay the animation to prevent it from distorting on mount
    setTimeout(() => {
      setShow(true);
    }, 100);

    return () => {
      setShow(false);
    };
  }, []);

  useEffect(() => {
    if (speaking) {
      controls.start('speaking');
    } else {
      controls.start('hushed');
    }
  }, [speaking, show]);

  return (
    <AnimatePresence>
      {speaking && show && (
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 120 120"
          width="26"
          height="26"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ exit: { duration: 0.15 } }}
        >
          {lines.map((value: any, idx: number) => (
            <motion.path
              key={`path-${idx}`}
              initial={'hushed'}
              exit={'hushed'}
              animate={controls}
              variants={variants}
              custom={value.delay}
              strokeLinecap={'round'}
              strokeLinejoin={'miter'}
              strokeMiterlimit={10}
              fillOpacity={0}
              stroke={defaultStrokeColor}
              strokeOpacity={1}
              strokeWidth={10}
              d={value.path}
            ></motion.path>
          ))}
        </motion.svg>
      )}
    </AnimatePresence>
  );
};
