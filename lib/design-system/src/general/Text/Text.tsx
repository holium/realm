import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { Box, BoxProps, boxStyles } from '../Box/Box';
import { colorStyle } from '../../util/colors';
import { skeletonStyle } from '../../general/Skeleton/Skeleton';

export const fontByType = {
  body: '"Rubik", sans-serif',
  heading: '"Rubik", sans-serif',
  monospace: 'Source Code Pro, monospace',
};

export const fontByName = {
  Rubik: '"Rubik", sans-serif',
  'Source Code Pro': 'Source Code Pro, monospace',
  Inter: 'Inter, sans-serif',
};

export const fontSizes = [
  '0.702rem', // 0 == 10px
  '0.79rem', //  1 == 12px
  '0.889rem', // 2 == 14px
  '1rem', //     3 == 16px
  '1.125rem', // 4
  '1.266rem', // 5
  '1.424rem', // 6
  '1.602rem', // 7
  '1.802rem', // 8
  '2.027rem', // 9
  '2.281rem', // 10
];

export type TextProps = {
  fontWeight?: number;
  fontByName?: keyof typeof fontByName;
  fontByType?: keyof typeof fontByType;
  fontSize?: string | number;
  truncate?: boolean;
  noSelection?: boolean;
} & BoxProps;

const customStyling = css<TextProps>`
  && {
    ${(props) =>
      props.fontByName &&
      css`
        font-family: ${fontByName[props.fontByName]};
      `};
    ${(props) =>
      props.fontByType &&
      css`
        font-family: ${fontByType[props.fontByType]};
      `}

    ${(props) =>
      props.truncate &&
      css`
        position: relative;
        white-space: nowrap;
        overflow: hidden !important;
        text-overflow: ellipsis;
      `}
  /* if fontSize is a number use fontSizes array */
    ${(props) =>
      typeof props.fontSize === 'number' &&
      css`
        font-size: ${props.fontSize <= 10
          ? fontSizes[props.fontSize]
          : `${props.fontSize / 16}rem`};
      `}
    ${(props) => props.fontWeight && `font-weight: ${props.fontWeight};`}
    ${(props) => props.noSelection && 'user-select: none;'}
  }
`;

const Default = styled(Box)<TextProps>`
  color: rgba(var(--rlm-text-rgba));
  font-family: var(--rlm-font);
  font-weight: 400;
  font-size: 0.889rem;
  line-height: normal;
  margin-top: 0px;
  margin-bottom: 0px;
  user-select: text;
  ${customStyling}
`;

const H1 = styled(Default)<TextProps>`
  font-weight: 700;
  line-height: 1.5rem;
  font-size: 1.8rem;
  ${colorStyle}
`;

const H2 = styled(Default)<TextProps>`
  font-weight: 600;
  line-height: 1.5rem;
  font-size: 1.6rem;
  ${colorStyle}
`;

const H3 = styled(Default)<TextProps>`
  font-weight: 600;
  line-height: 1.25rem;
  font-size: 1.42rem;
  ${colorStyle}
`;

const H4 = styled(Default)<TextProps>`
  font-weight: 500;
  line-height: 1.25rem;
  font-size: 1.26rem;
  ${colorStyle}
`;

const H5 = styled(Default)<TextProps>`
  font-weight: 500;
  line-height: 1.25rem;
  font-size: 1.125rem;
  ${colorStyle}
`;

const H6 = styled(Default)<TextProps>`
  font-weight: 400;
  line-height: 1rem;
  font-size: 1rem;
  ${colorStyle}
`;

const Body = styled(Default)<TextProps>`
  font-weight: 400;
  line-height: normal;
  font-size: 0.9rem;
  ${colorStyle}
`;

const Caption = styled(Default)<TextProps>`
  font-weight: 400;
  line-height: normal;
  font-size: 0.9rem;
  ${colorStyle}
`;

const Hint = styled(Default)<TextProps>`
  font-weight: 400;
  line-height: normal;
  font-size: 0.702rem;
  ${colorStyle}
`;

const Label = styled(Default)<TextProps>`
  font-weight: 500;
  line-height: 1.1rem;
  font-size: 0.8rem;
  ${colorStyle}
`;

const Custom = styled(Box)<TextProps>`
  user-select: text;
  ${customStyling}
`;

const Patp = styled(motion.p)<TextProps>`
  font-weight: 400;
  line-height: normal;
  font-size: 0.9rem;
  font-family: 'Source Code Pro', monospace;
  color: rgba(var(--rlm-text-rgba));
  margin-top: 0px;
  margin-bottom: 0px;
  user-select: text;
  ${({ isSkeleton }) => isSkeleton && skeletonStyle}
`;

const Anchor = styled(motion.a)<TextProps>`
  &:hover {
    cursor: pointer;
    text-decoration: underline;
  }
  ${({ isSkeleton }: TextProps) =>
    isSkeleton &&
    css`
      line-height: normal;
      ${skeletonStyle}
    `};
  ${boxStyles}
  ${colorStyle}
  ${(props) =>
    props.truncate &&
    css`
      position: relative;
      white-space: nowrap;
      overflow: hidden !important;
      text-overflow: ellipsis;
    `}
`;

export const Text = {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Body,
  Caption,
  Hint,
  Label,
  Custom,
  Patp,
  Default,
  Anchor,
};
