import styled, { css } from 'styled-components';
import { Box, BoxProps } from '../../components/Box/Box';
import { motion } from 'framer-motion';

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
  fontByName?: keyof typeof fontByName;
  fontByType?: keyof typeof fontByType;
  fontSize?: string | number;
  variant?:
    | 'body'
    | 'caption'
    | 'hint'
    | 'label'
    | 'patp'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'inherit';
} & BoxProps;

export const BaseText = styled(Box)<TextProps>`
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

  &:disabled {
    color: var(--rlm-text-disabled);
  }
`;

export const Default = styled(BaseText)<TextProps>`
  font-family: var(--rlm-font);
  font-weight: 400;
  font-size: 0.889rem;
  line-height: normal;
  margin-top: 0px;
  margin-bottom: 0px;
  white-space: nowrap;
`;

export const H1 = styled(Default)<TextProps>`
  font-weight: 700;
  line-height: 1.5rem;
  font-size: 1.8rem;
`;

export const H2 = styled(Default)<TextProps>`
  font-weight: 600;
  line-height: 1.5rem;
  font-size: 1.6rem;
`;

export const H3 = styled(Default)<TextProps>`
  font-weight: 600;
  line-height: 1.25rem;
  font-size: 1.42rem;
`;

export const H4 = styled(Default)<TextProps>`
  font-weight: 500;
  line-height: 1.25rem;
  font-size: 1.26rem;
`;

export const H5 = styled(Default)<TextProps>`
  font-weight: 500;
  line-height: 1.25rem;
  font-size: 1.125rem;
`;

export const H6 = styled(Default)<TextProps>`
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
  font-size: 0.8rem;
`;

const Label = styled(Default)<TextProps>`
  font-weight: 500;
  line-height: 1.1rem;
  font-size: 0.8rem;
`;

const Custom = styled(BaseText)<TextProps>`
  margin-top: 0px;
  margin-bottom: 0px;
`;

const Patp = styled(motion.p)<TextProps>`
  font-weight: 400;
  line-height: normal;
  font-size: 0.9rem;
  font-family: 'Source Code Pro', monospace;
  color: var(--rlm-text-color);
  margin-top: 0px;
  margin-bottom: 0px;
`;

export const Anchor = styled(motion.a)<TextProps>`
  ${(props) =>
    props.fontByName &&
    css`
      font-family: ${props.theme.font.byName[props.fontByName]};
    `};
  ${(props) =>
    props.fontByType &&
    css`
      font-family: ${props.theme.fonts.byType[props.fontByType]};
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
