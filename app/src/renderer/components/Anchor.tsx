import { motion } from 'framer-motion';
import { darken } from 'polished';
import styled, { css } from 'styled-components';

import { TextProps, textVariants } from './Text';
import { typographyFunctions } from './typography-functions';

export const Anchor = styled(motion.a)<TextProps>`
  ${textVariants}
  ${typographyFunctions}
  ${(props) =>
    props.fontByName &&
    css`
      font-family: ${props.theme.fontByName[props.fontByName]};
    `};
  ${(props) =>
    props.fontByType &&
    css`
      font-family: ${props.theme.fonts[props.fontByType]};
    `}
  ${(props) =>
    props.color &&
    css`
      color: ${props.color};
      &:hover {
        color: ${darken(0.02, props.color)};
      }
    `}
`;

Anchor.defaultProps = {
  variant: 'inherit',
};
