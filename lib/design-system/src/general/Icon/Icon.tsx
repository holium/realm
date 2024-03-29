import { forwardRef, useState } from 'react';
import { motion, SVGMotionProps } from 'framer-motion';
import styled from 'styled-components';
import {
  color,
  compose,
  height,
  HeightProps,
  layout,
  LayoutProps,
  space,
  SpaceProps,
  typography,
  TypographyProps,
  width,
  WidthProps,
} from 'styled-system';

import { ColorVariants } from '../../util/colors';
import { BoxProps } from '../Box/Box';
import { IconPathsType, paths } from './icons';

export type IconProps = BoxProps &
  SpaceProps &
  LayoutProps &
  TypographyProps &
  WidthProps &
  HeightProps & {
    fill?: ColorVariants;
    iconColor?: string;
  };

const SvgComponent = forwardRef<
  SVGSVGElement,
  SVGMotionProps<SVGSVGElement> & {
    name: IconPathsType;
    title?: string;
    iconColor?: string;
    onClick?: () => void;
  }
>(({ title, name, width, height, onClick, iconColor, ...rest }, svgRef) => {
  const [titleId] = useState(() => (title ? uuid() : undefined));

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width ?? 24} ${height ?? 24}`}
      width={width || '1em'}
      height={height || '1em'}
      ref={svgRef}
      aria-labelledby={titleId}
      pointerEvents="none"
      onClick={onClick}
      {...rest}
      fill={iconColor}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {/* @ts-ignore */}
      {paths[name]}
    </motion.svg>
  );
});

SvgComponent.displayName = 'SvgComponent';

export const Icon = styled(SvgComponent)<IconProps>`
  flex: none;
  vertical-align: middle;
  fill: ${({ fill = 'icon' }) => `rgba(var(--rlm-${fill}-rgba))`};
  ${({ iconColor }) => iconColor && `fill: ${iconColor}`};
  ${compose(space, color, width, height, layout, typography)};
`;

let lastId = 0;

function uuid() {
  lastId++;
  return `icon-${lastId}`;
}
