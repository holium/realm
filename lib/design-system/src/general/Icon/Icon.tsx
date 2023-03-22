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
import { ColorProps, colorStyle } from '../../util/colors';

export type IconProps = BoxProps &
  SpaceProps &
  Pick<ColorProps, 'fill'> &
  LayoutProps &
  TypographyProps &
  WidthProps &
  HeightProps;

const SvgComponent = forwardRef<
  SVGSVGElement,
  SVGMotionProps<SVGSVGElement> & {
    name: IconPathsType;
    title?: string;
    customFill?: string;
    onClick?: () => void;
  }
>(({ title, name, width, height, onClick, ...rest }, svgRef) => {
  const [titleId] = useState(() => (title ? uuid() : undefined));

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
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
  ${colorStyle}
  ${({ customFill }) => customFill && `fill: ${customFill};`}
  ${compose(space, color, width, height, layout, typography)}
`;

let lastId = 0;

function uuid() {
  lastId++;
  return `icon-${lastId}`;
}
