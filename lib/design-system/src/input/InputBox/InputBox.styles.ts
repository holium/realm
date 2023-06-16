import { AnimationProps } from 'framer-motion';
import styled, { css } from 'styled-components';

import { Box, BoxProps, Flex } from '../../../general';

export type InputBoxContainerProps = {
  label?: string;
  leftAdornment?: JSX.Element | string;
  rightAdornment?: JSX.Element | string;
  shouldHighlightOnFocus?: boolean;
  disabled?: boolean;
  small?: boolean;
  bgOpacity?: number;
  wrapperMotionProps?: AnimationProps;
  error?: string | boolean | undefined;
} & BoxProps;

export const InputBoxContainer = styled(Flex)<InputBoxContainerProps>`
  position: relative;
  align-items: center;
  border: 1px solid rgba(var(--rlm-border-rgba));
  background-color: rgba(var(--rlm-input-rgba));
  min-height: 32px;
  box-sizing: content-box;
  overflow: hidden;

  ${(props) =>
    props.shouldHighlightOnFocus &&
    css`
      &:focus,
      &:focus-within {
        transition: var(--transition);
        outline: none;
        border-color: rgba(var(--rlm-accent-rgba));
      }
    `}

  input {
    font-size: ${(props) =>
      `${props.fontSize ? props.fontSize.toString().replace('px', '') : 14}px`};
    text-align: ${(props) => (props.textAlign ? props.textAlign : 'left')};
    /* border-radius: var(--rlm-border-radius-4); */
    background-color: rgba(var(--rlm-input-rgba));
    color: rgba(var(--rlm-text-rgba));
    pointer-events: all;
    flex: 1;
    height: inherit;
    appearance: none;
    outline: none;
    border: 1px transparent;
  }

  input[type='password'] {
    letter-spacing: 0.125em;
  }
  input[type='password']::placeholder {
    letter-spacing: 0em;
  }

  ${(props) =>
    props.disabled &&
    css`
      pointer-events: none;
      input {
        pointer-events: none;
      }
      opacity: 0.6; /* correct opacity on iOS */
      &::placeholder {
        color: rgba(var(--rlm-text-rgba, #333333), 0.3);
        opacity: 1;
      }
      &:hover {
        border-color: transparent;
      }
    `}

  ${(props) =>
    props.error &&
    css`
      border-color: rgba(var(--rlm-intent-alert-rgba));
      &:focus,
      &:focus-within,
      &:active {
        transition: ${(props) => props.theme.transition};
        outline: none;
        border-color: rgba(var(--rlm-intent-alert-rgba));
        &::placeholder {
          color: transparent;
        }
      }
    `}

  /* Gets rid of Chrome's autofill styling */
  input:-webkit-autofill,
  input:-webkit-autofill:focus {
    transition: background-color 600000s 0s, color 600000s 0s;
  }
`;

export const InputBoxAdornment = styled(Box)<BoxProps & { disabled?: boolean }>`
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  svg {
    display: block;
    ${(props) =>
      props.disabled &&
      css`
        opacity: 0.5;
      `};
    font-size: 14px;
  }
`;

InputBoxContainer.defaultProps = {
  px: 1,
  py: 0,
  mb: 0,
  shouldHighlightOnFocus: true,
};
