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
import { BoxProps } from '../Box/Box';
import { ColorVariants, getVar } from '../../util/colors';

export type IconProps = BoxProps &
  SpaceProps &
  Omit<ColorProps, 'color'> &
  LayoutProps &
  TypographyProps &
  WidthProps &
  HeightProps;

const SvgComponent = forwardRef<
  SVGSVGElement,
  SVGMotionProps<SVGSVGElement> & {
    name: IconPathsType;
    title?: string;
    color?: ColorVariants;
    iconColor?: string;
  }
>(({ title, name, width, height, color, iconColor, ...rest }, svgRef) => {
  const [titleId] = useState(() => (title ? uuid() : undefined));

  let fillColor = iconColor || (color && getVar(color)) || 'currentcolor';
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={width || '1em'}
      height={height || '1em'}
      fill={fillColor}
      ref={svgRef}
      aria-labelledby={titleId}
      pointerEvents="none"
      {...rest}
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
