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
  LayoutProps,
  TypographyProps,
} from 'styled-system';
import { IconPathsType, paths } from './icons';
import { BoxProps } from '../Box/Box';
import { ColorVariants } from '../../util/colors';

export type IconProps = BoxProps &
  SpaceProps &
  LayoutProps &
  TypographyProps &
  WidthProps &
  HeightProps & {
    fill?: ColorVariants;
  };

const SvgComponent = forwardRef<
  SVGSVGElement,
  SVGMotionProps<SVGSVGElement> & {
    name: IconPathsType;
    title?: string;
    onClick?: () => void;
  }
>(({ title, name, width, height, onClick, ...rest }, svgRef) => {
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
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {paths[name]}
    </motion.svg>
  );
});

SvgComponent.displayName = 'SvgComponent';

export const Icon = styled(SvgComponent)<IconProps>`
  flex: none;
  vertical-align: middle;
  fill: ${({ fill = 'icon' }) => `rgba(var(--rlm-${fill}-rgba))`};
  ${compose(space, color, width, height, layout, typography)};
`;

let lastId = 0;

function uuid() {
  lastId++;
  return `icon-${lastId}`;
}
