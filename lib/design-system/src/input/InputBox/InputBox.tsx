import styled, { css } from 'styled-components';
import { Text, Box, BoxProps } from '../..';
import { AnimationProps } from 'framer-motion';

type StyledBoxProps = {
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

const StyledBox = styled(Box)<StyledBoxProps>`
  position: relative;
  border: 1px solid var(--rlm-border-color);
  background-color: var(--rlm-input-color);
  overflow: hidden;
  min-height: 32px;
  box-sizing: content-box;

  ${(props) =>
    props.shouldHighlightOnFocus &&
    css`
      &:focus,
      &:focus-within,
      &:active {
        transition: var(--transition);
        outline: none;
        border-color: var(--rlm-accent-color);
        &::placeholder {
          color: transparent;
        }
      }
    `}

  input {
    border-radius: var(--rlm-border-radius-4);
    background-color: var(--rlm-input-color);
    color: var(--rlm-text-color);
    pointer-events: all;
    flex: 1;
    height: inherit;
    appearance: none;
    outline: none;
    border: 1px transparent;
    &::placeholder {
      opacity: 0.5;
    }
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
        color: rgba(var(--rlm-text-color, #333333), 0.3);
        opacity: 1;
      }
      &:hover {
        border-color: transparent;
      }
    `}

  ${(props) =>
    props.error &&
    css`
      border-color: var(--rlm-intent-alert-color);
      &:focus,
      &:focus-within,
      &:active {
        transition: ${(props) => props.theme.transition};
        outline: none;
        border-color: var(--rlm-intent-alert-color);
        &::placeholder {
          color: transparent;
        }
      }
    `}
`;

const Adornment = styled(Box)<BoxProps & { disabled?: boolean }>`
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

StyledBox.defaultProps = {
  px: 1,
  py: 0,
  mb: 0,
  shouldHighlightOnFocus: true,
};

export type InputBoxProps = StyledBoxProps & {
  inputId: string;
  inlineLabelDirection?: 'row' | 'column';
};

export const InputBox = ({
  width,
  height,
  inputId = 'base-input-1',
  inlineLabelDirection = 'row',
  leftAdornment,
  label,
  rightAdornment,
  disabled,
  error,
  children,
  borderRadius = '6px',
}: InputBoxProps) => (
  <StyledBox
    width={width}
    height={height}
    error={error}
    borderRadius={borderRadius}
    flexDirection={inlineLabelDirection}
    disabled={disabled}
    onFocus={() => document.getElementById(inputId)?.focus()}
  >
    {label && label !== 'none' && (
      <Text.Label
        ml="2px"
        color="accent"
        display="flex"
        fontWeight="500"
        mr={1}
        alignItems="center"
        mb={inlineLabelDirection === 'column' ? 1 : 0}
        pointerEvents="none"
      >
        {label}
      </Text.Label>
    )}
    <Box display="flex" flexDirection="row" flex={1} height="inherit">
      {leftAdornment && (
        <Adornment mr={1} disabled={disabled}>
          {leftAdornment}
        </Adornment>
      )}
      {children}
      {rightAdornment && (
        <Adornment ml={1} disabled={disabled}>
          {rightAdornment}
        </Adornment>
      )}
    </Box>
    {error && (
      <Box position="absolute" left={0} bottom={-18}>
        <Text.Hint color="intent-alert">{error}</Text.Hint>
      </Box>
    )}
  </StyledBox>
);
