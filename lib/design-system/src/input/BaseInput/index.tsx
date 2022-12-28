import { FC } from 'react';
import styled, { css } from 'styled-components';
import { Text, Box, BoxProps } from '../..';
import { AnimationProps } from 'framer-motion';

export type InputBoxProps = {
  label?: string;
  leftAdornment?: JSX.Element | string;
  leftInteractive?: boolean;
  rightAdornment?: JSX.Element | string;
  rightInteractive?: boolean;
  preventPointerEvents?: boolean;
  shouldHighlightOnFocus?: boolean;
  isDisabled?: boolean;
  small?: boolean;
  bgOpacity?: number;
  wrapperMotionProps?: AnimationProps;
  error?: string | boolean | undefined;
} & BoxProps;

export const InputBoxStyle = styled(Box)<InputBoxProps>`
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
  ${(props) =>
    props.preventPointerEvents &&
    css`
      pointer-events: none;
    `};

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

  ${(props) =>
    props.isDisabled &&
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
      border-color: var(--rlm-alert-color);
      &:focus,
      &:focus-within,
      &:active {
        transition: ${(props) => props.theme.transition};
        outline: none;
        border-color: var(--rlm-alert-color);
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
      props.disabled
        ? css`
            fill: rgba(var(--rlm-icon-color), 0.5);
          `
        : css`
            fill: var(--rlm-icon-color);
          `};
    font-size: 14px;
  }
`;

InputBoxStyle.defaultProps = {
  px: 1,
  py: 1,
  mb: 0,
  preventPointerEvents: false,
  shouldHighlightOnFocus: true,
};

export type BaseInputProps = InputBoxProps & {
  inputId: string;
  inlineLabelDirection?: 'row' | 'column';
};

export const BaseInput: FC<BaseInputProps> = (props: BaseInputProps) => {
  const {
    inputId,
    inlineLabelDirection,
    leftAdornment,
    label,
    leftInteractive,
    rightAdornment,
    rightInteractive,
    isDisabled,
    error,
    children,
  } = props;

  return (
    <InputBoxStyle
      display="flex"
      width={props.width}
      height={props.height}
      error={error}
      flexDirection={inlineLabelDirection}
      isDisabled={isDisabled}
      onMouseDown={(evt: React.MouseEvent<HTMLDivElement>) => {
        evt.preventDefault();
        evt.stopPropagation();
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
          pointerEvents={false}
        >
          {label}
        </Text.Label>
      )}
      <Box display="flex" flexDirection="row" flex={1}>
        {leftAdornment && (
          <Adornment
            pointerEvents={leftInteractive}
            mr={1}
            disabled={isDisabled}
          >
            {leftAdornment}
          </Adornment>
        )}
        {children}
        {rightAdornment && (
          <Adornment
            pointerEvents={rightInteractive}
            ml={1}
            disabled={isDisabled}
          >
            {rightAdornment}
          </Adornment>
        )}
      </Box>
    </InputBoxStyle>
  );
};

BaseInput.defaultProps = {
  inlineLabelDirection: 'row',
};

export default BaseInput;
