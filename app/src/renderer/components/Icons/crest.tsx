import { motion } from 'framer-motion';
import React, { forwardRef } from 'react';
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
      <motion.path
        d="M12 7.07142C12 9.79339 9.79336 12 7.07138 12C4.34941 12 2.14281 9.79339 2.14281 7.07142C2.14281 4.34945 4.34941 2.14285 7.07138 2.14285C9.79336 2.14285 12 4.34945 12 7.07142Z"
        fill="white"
      />
      <motion.path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M14.1429 7.07143C14.1429 10.9769 10.9769 14.1429 7.07143 14.1429C3.16599 14.1429 0 10.9769 0 7.07143C0 3.16599 3.16599 0 7.07143 0C10.9769 0 14.1429 3.16599 14.1429 7.07143ZM7.07138 12C9.79336 12 12 9.79339 12 7.07142C12 4.34945 9.79336 2.14285 7.07138 2.14285C4.34941 2.14285 2.14281 4.34945 2.14281 7.07142C2.14281 9.79339 4.34941 12 7.07138 12Z"
        animate={{ fill: props.fill }}
      />
      <motion.path
        d="M21.8571 16.9286C21.8571 19.6505 19.6505 21.8571 16.9286 21.8571C14.2066 21.8571 12 19.6505 12 16.9286C12 14.2066 14.2066 12 16.9286 12C19.6505 12 21.8571 14.2066 21.8571 16.9286Z"
        fill="white"
      />
      <motion.path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M24.0001 16.9286C24.0001 20.834 20.8341 24 16.9286 24C13.0232 24 9.85719 20.834 9.85719 16.9286C9.85719 13.0231 13.0232 9.85715 16.9286 9.85715C20.8341 9.85715 24.0001 13.0231 24.0001 16.9286ZM16.9286 21.8571C19.6505 21.8571 21.8571 19.6505 21.8571 16.9286C21.8571 14.2066 19.6505 12 16.9286 12C14.2066 12 12 14.2066 12 16.9286C12 19.6505 14.2066 21.8571 16.9286 21.8571Z"
        animate={{ fill: props.fill }}
      />
      <motion.path
        d="M12 16.9286C12 19.6505 9.79336 21.8571 7.07138 21.8571C4.34941 21.8571 2.14281 19.6505 2.14281 16.9286C2.14281 14.2066 4.34941 12 7.07138 12C9.79336 12 12 14.2066 12 16.9286Z"
        fill="white"
      />
      <motion.path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M14.1429 16.9286C14.1429 20.834 10.9769 24 7.07143 24C3.16599 24 0 20.834 0 16.9286C0 13.0231 3.16599 9.85715 7.07143 9.85715C10.9769 9.85715 14.1429 13.0231 14.1429 16.9286ZM7.07138 21.8571C9.79336 21.8571 12 19.6505 12 16.9286C12 14.2066 9.79336 12 7.07138 12C4.34941 12 2.14281 14.2066 2.14281 16.9286C2.14281 19.6505 4.34941 21.8571 7.07138 21.8571Z"
        animate={{ fill: props.fill }}
      />
      <motion.path
        d="M21.8571 7.07142C21.8571 9.79339 19.6505 12 16.9286 12C14.2066 12 12 9.79339 12 7.07142C12 4.34945 14.2066 2.14285 16.9286 2.14285C19.6505 2.14285 21.8571 4.34945 21.8571 7.07142Z"
        fill="white"
      />
      <motion.path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M24.0001 7.07143C24.0001 10.9769 20.8341 14.1429 16.9286 14.1429C13.0232 14.1429 9.85719 10.9769 9.85719 7.07143C9.85719 3.16599 13.0232 0 16.9286 0C20.8341 0 24.0001 3.16599 24.0001 7.07143ZM16.9286 12C19.6505 12 21.8571 9.79339 21.8571 7.07142C21.8571 4.34945 19.6505 2.14285 16.9286 2.14285C14.2066 2.14285 12 4.34945 12 7.07142C12 9.79339 14.2066 12 16.9286 12Z"
        animate={{ fill: props.fill }}
      />
    </motion.svg>
  );
});

export const CrestSymbol = styled(SvgComponent)<IconProps>`
  flex: none;
  vertical-align: middle;
  ${compose(space, color, width, height, layout, typography)}
`;

export default CrestSymbol;
