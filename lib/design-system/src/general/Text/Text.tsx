import styled, { css } from 'styled-components';
import { Box, BoxProps, boxStyles } from '../Box/Box';
import { motion } from 'framer-motion';
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
`;

const H2 = styled(Default)<TextProps>`
  font-weight: 600;
  line-height: 1.5rem;
  font-size: 1.6rem;
`;

const H3 = styled(Default)<TextProps>`
  font-weight: 600;
  line-height: 1.25rem;
  font-size: 1.42rem;
`;

const H4 = styled(Default)<TextProps>`
  font-weight: 500;
  line-height: 1.25rem;
  font-size: 1.26rem;
`;

const H5 = styled(Default)<TextProps>`
  font-weight: 500;
  line-height: 1.25rem;
  font-size: 1.125rem;
`;

const H6 = styled(Default)<TextProps>`
  font-weight: 400;
  line-height: 1rem;
  font-size: 1rem;
`;

const Body = styled(Default)<TextProps>`
  font-weight: 400;
  line-height: normal;
  font-size: 0.9rem;
`;

const Caption = styled(Default)<TextProps>`
  font-weight: 400;
  line-height: normal;
  font-size: 0.9rem;
`;

const Hint = styled(Default)<TextProps>`
  font-weight: 400;
  line-height: normal;
  font-size: 0.702rem;
`;

const Label = styled(Default)<TextProps>`
  font-weight: 500;
  line-height: 1.1rem;
  font-size: 0.8rem;
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
