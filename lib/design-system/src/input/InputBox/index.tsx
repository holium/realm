import { FC } from 'react';
import styled, { css } from 'styled-components';
import { Text, Box, BoxProps } from '../..';
import { AnimationProps } from 'framer-motion';

export type InputBoxStyleProps = {
  label?: string;
  leftAdornment?: JSX.Element | string;
  leftInteractive?: boolean;
  rightAdornment?: JSX.Element | string;
  rightInteractive?: boolean;
  shouldHighlightOnFocus?: boolean;
  disabled?: boolean;
  small?: boolean;
  bgOpacity?: number;
  wrapperMotionProps?: AnimationProps;
  error?: string | undefined;
} & BoxProps;

const InputBoxStyle = styled(Box)<InputBoxStyleProps>`
  position: relative;
  border-radius: var(--rlm-border-radius-6);
  border: 1px solid var(--rlm-border-color);
  background-color: var(--rlm-input-color);
  min-height: 32px;
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

InputBoxStyle.defaultProps = {
  px: 1,
  py: 1,
  mb: 0,
  shouldHighlightOnFocus: true,
};

export type InputBoxProps = InputBoxStyleProps & {
  inputId: string;
  inlineLabelDirection?: 'row' | 'column';
};

export const InputBox: FC<InputBoxProps> = (props: InputBoxProps) => {
  const {
    inputId = 'base-input-1',
    inlineLabelDirection = 'row',
    leftAdornment,
    label,
    leftInteractive,
    rightAdornment,
    rightInteractive,
    disabled,
    error,
    children,
  } = props;

  return (
    <InputBoxStyle
      display="flex"
      contentEditable="true"
      suppressContentEditableWarning={true}
      width={props.width}
      height={props.height}
      error={error}
      flexDirection={inlineLabelDirection}
      disabled={disabled}
      // pointerEvents="none"
      onFocus={(_evt: React.FocusEvent<HTMLDivElement>) => {
        document.getElementById(inputId)?.focus();
      }}
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
      <Box display="flex" flexDirection="row" flex={1}>
        {leftAdornment && (
          <Adornment
            pointerEvents={leftInteractive ? 'auto' : 'none'}
            mr={1}
            disabled={disabled}
          >
            {leftAdornment}
          </Adornment>
        )}
        {children}
        {rightAdornment && (
          <Adornment
            pointerEvents={rightInteractive ? 'auto' : 'none'}
            ml={1}
            disabled={disabled}
          >
            {rightAdornment}
          </Adornment>
        )}
      </Box>
      {error && (
        <Box position="absolute" bottom={-20}>
          <Text.Hint color="intent-alert">{error}</Text.Hint>
        </Box>
      )}
    </InputBoxStyle>
  );
};

export default InputBox;
