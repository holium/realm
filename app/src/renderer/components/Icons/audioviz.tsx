import { motion, useAnimationControls, Variants } from 'framer-motion';
import { SVGProps, useEffect } from 'react';
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
    path: ' M48.5,4.82285737991333 C48.5,4.82285737991333 48.5,33.13264465332031 48.5,33.13264465332031',
    delay: 0,
  },
  {
    path: ' M43,13.411428451538086 C43,13.411428451538086 43,24.588571548461914 43,24.588571548461914',
    delay: 0.1,
  },
  {
    path: ' M37,15.588571548461914 C37,15.588571548461914 37,22.411428451538086 37,22.411428451538086',
    delay: 0.2,
  },
  {
    path: ' M31,9.177143096923828 C31,9.177143096923828 31,28.822856903076172 31,28.822856903076172',
    delay: 0.3,
  },
  {
    path: ' M25,4.82285737991333 C25,4.82285737991333 25,33.17714309692383 25,33.17714309692383',
    delay: 0.4,
  },
  {
    path: ' M19,12.693714141845703 C19,12.693714141845703 19,25.26178741455078 19,25.26178741455078',
    delay: 0.3,
  },
  {
    path: ' M13,15.588571548461914 C13,15.588571548461914 13,22.411428451538086 13,22.411428451538086',
    delay: 0.2,
  },
  {
    path: ' M7,9.177143096923828 C7,9.177143096923828 7,28.822856903076172 7,28.822856903076172',
    delay: 0.1,
  },
  {
    path: ' M1.5,4.82285737991333 C1.5,4.82285737991333 1.5,33.17714309692383 1.5,33.17714309692383',
    delay: 0,
  },
];

const defaultStrokeColor = '#00c8ec';

const variants: Variants = {
  speaking: (delay: number) => ({
    stroke: defaultStrokeColor,
    scaleY: 1,
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      delay: delay,
      duration: 0.2,
    },
  }),
  hushed: {
    stroke: '#cecece',
    scaleY: 0,
  },
};

export const AudioWave = ({ speaking }: any) => {
  const controls = useAnimationControls();

  useEffect(() => {
    if (speaking) {
      controls.start('speaking');
    } else {
      controls.start('hushed');
    }
  }, [speaking]);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      width="24"
      height="24"
    >
      {lines.map((value: any, idx: number) => (
        <motion.path
          key={`path-${idx}`}
          initial={'hushed'}
          animate={controls}
          variants={variants}
          custom={value.delay}
          strokeLinecap={'round'}
          strokeLinejoin={'miter'}
          fillOpacity={0}
          strokeMiterlimit={10}
          stroke={defaultStrokeColor}
          strokeOpacity={1}
          strokeWidth={3}
          d={value.path}
        ></motion.path>
      ))}
    </motion.svg>
  );
};
