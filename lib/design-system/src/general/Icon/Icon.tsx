import { BoxProps } from '../Box/Box';
import { motion, SVGMotionProps } from 'framer-motion';
import { forwardRef, useState } from 'react';
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
import { IconPathsType, paths } from './icons';

export type IconProps = BoxProps &
  SpaceProps &
  ColorProps &
  LayoutProps &
  TypographyProps &
  WidthProps &
  HeightProps;

const SvgComponent = forwardRef<
  SVGSVGElement,
  SVGMotionProps<SVGSVGElement> & {
    name: IconPathsType;
    title?: string;
    iconColor?: string;
  }
>(({ title, name, ...props }, svgRef) => {
  const [titleId] = useState(() => (title ? uuid() : undefined));
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={props.width || '1em'}
      height={props.height || '1em'}
      fill={props.iconColor ? props.iconColor : 'currentcolor'}
      ref={svgRef}
      aria-labelledby={titleId}
      pointerEvents="none"
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {/* @ts-expect-error */}
      {paths[name]}
    </motion.svg>
  );
});

SvgComponent.displayName = 'SvgComponent';

export const Icon = styled(SvgComponent)<IconProps>`
  flex: none;
  vertical-align: middle;
  ${compose(space, color, width, height, layout, typography)}
`;

let lastId = 0;

export function uuid() {
  lastId++;
  return `icon-${lastId}`;
}

export default Icon;
