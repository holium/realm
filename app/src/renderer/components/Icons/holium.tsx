import { motion } from 'framer-motion';
import React, { forwardRef, useState } from 'react';
import styled from 'styled-components';
import {
  compose,
  space,
  color,
  layout,
  width,
  height,
  typography,
  WidthProps,
  HeightProps,
  SpaceProps,
  ColorProps,
  LayoutProps,
  TypographyProps,
} from 'styled-system';

export type IconProps = SpaceProps &
  ColorProps &
  LayoutProps &
  TypographyProps &
  WidthProps &
  HeightProps;
const SvgComponent = forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement> & {
    title?: string;
  }
>(({ title, name, ...props }, svgRef) => {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={props.width || '1em'}
      height={props.height || '1em'}
      fill="currentcolor"
      className="item"
    >
      <motion.circle
        cx="12px"
        cy="12px"
        r="11px"
        rotate="90%"
        fill="none"
        stroke={props.fill}
        strokeWidth="1.5px"
        transition={{ delay: 0.1, duration: 1 }}
        // variants={circle}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
      />
      <motion.path
        fill={props.fill}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, opacity: 2, ease: 'easeInOut' }}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.7747 3.02161C14.8164 3.19673 16.8097 4.06548 18.3721 5.62788C19.9345 7.19028 20.8033 9.18365 20.9784 11.2253H15.2389C13.8779 11.2253 12.7747 10.1221 12.7747 8.76116V3.02161ZM21 12.4574C20.8913 14.6089 20.0154 16.7289 18.3721 18.3721C16.8097 19.9345 14.8164 20.8033 12.7747 20.9784V14.9216C12.7747 13.5607 13.8779 12.4574 15.2389 12.4574H21ZM11.5426 21C9.39111 20.8913 7.27113 20.0154 5.62788 18.3721C3.98464 16.7289 3.10868 14.6089 3.00001 12.4574H9.07844C10.4394 12.4574 11.5426 13.5607 11.5426 14.9216V21ZM3.02162 11.2253C3.19672 9.18365 4.06548 7.19028 5.62788 5.62788C7.27113 3.98463 9.39111 3.10867 11.5426 3V8.76116C11.5426 10.1221 10.4394 11.2253 9.07844 11.2253H3.02162Z"
        fillOpacity="0.9"
      />
    </motion.svg>
  );
});

export const HoliumAnimated = styled(SvgComponent)<IconProps>`
  flex: none;
  vertical-align: middle;
  ${compose(space, color, width, height, layout, typography)}
`;

export default HoliumAnimated;
