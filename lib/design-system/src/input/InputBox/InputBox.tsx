import styled, { css } from 'styled-components';
import { Text, Box, BoxProps, Flex } from '../../general';
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

const StyledBox = styled(Flex)<StyledBoxProps>`
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
      &:focus-within,
      &:active {
        transition: var(--transition);
        outline: none;
        border-color: rgba(var(--rlm-accent-rgba));
        &::placeholder {
          color: transparent;
        }
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
`;

const Adornment = styled(Box)<BoxProps & { disabled?: boolean }>`
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
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
  background = 'currentColor',
  style,
  px,
  py,
  ...boxProps
}: InputBoxProps) => (
  <StyledBox
    style={style}
    width={width}
    height={height}
    error={error}
    borderRadius={borderRadius}
    background={background}
    flexDirection={inlineLabelDirection}
    disabled={disabled}
    onFocus={() => document.getElementById(inputId)?.focus()}
    fontSize={boxProps.fontSize || '14px'}
    textAlign={boxProps.textAlign || 'left'}
    px={px}
    py={py}
  >
    {label && label !== 'none' && (
      <Text.Label
        ml="2px"
        color="accent"
        display="flex"
        fontWeight={500}
        mr={1}
        alignItems="center"
        mb={inlineLabelDirection === 'column' ? 1 : 0}
        pointerEvents="none"
      >
        {label}
      </Text.Label>
    )}
    <Box display="flex" flexDirection="row" flex={1} height="100%">
      {leftAdornment && (
        <Adornment mr={1} disabled={disabled} pb={2}>
          {leftAdornment}
        </Adornment>
      )}
      {children}
      {rightAdornment && (
        <Adornment ml={1} disabled={disabled} pb={2}>
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
