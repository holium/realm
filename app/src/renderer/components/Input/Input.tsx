/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/prop-types */
import { FC, forwardRef } from 'react';
import styled, { css, StyledComponentProps } from 'styled-components';
import {
  compose,
  space,
  layout,
  flexbox,
  border,
  position,
  color,
  background,
  backgroundColor,
} from 'styled-system';
import { rgba } from 'polished';
import { Box, BoxProps } from '../Box';
import { Flex } from '../Flex';
import { TypographyFunctionsProps } from '../typography-functions';
import { Text } from '../Text';
import { ThemeType } from '../../theme';
import { AnimationProps } from 'framer-motion';

const inputTokens = {
  iconSize: 4, // icon size on font-size scale
  y: 2, // padding y
  x: 2, // padding x
};

type BaseInputProps = {
  as?: 'input' | 'textarea';
  /** Icon or ‘Interactive Icon’ adornment to apply to the left of the content area */
  leftIcon?: JSX.Element;
  leftLabel?: string;
  leftInteractive?: boolean;
  /** Icon or ‘Interactive Icon’ adornment to apply to the right of the content area */
  rightIcon?: JSX.Element;
  rightInteractive?: boolean;
  /** Does the input have a validation error */
  error?: string | boolean | undefined;
  variant?: any;
  hasPointerEvents?: boolean;
  shouldHighlightOnFocus?: boolean;
  isDisabled?: boolean;
  small?: boolean;
  bgOpacity?: number;
  wrapperMotionProps?: AnimationProps;
  theme: ThemeType;
} & TypographyFunctionsProps;

export type InputProps = StyledComponentProps<
  'input',
  any,
  BaseInputProps,
  never
>;

export const InputWrapper = styled(Flex)`
  /* display: block; */
  width: ${(props) => (props.width ? props.width : '100%')};
  ${(props) =>
    !props.hasPointerEvents &&
    css`
      pointer-events: none;
    `};
  transition: ${(props) => props.theme.transition};
  /* background-color: ${(props) => props.theme.colors.ui.tertiary}; */
  border: 1px solid
    ${(props: InputProps) =>
      props.error
        ? props.theme.colors.ui.intent.alert
        : props.theme.colors.ui.input.borderColor};
  border-radius: ${(props) => props.theme.input.borderRadius}px;
  textarea {
    resize: none;
  }

  ${(props) =>
    props.shouldHighlightOnFocus &&
    css`
      &:focus,
      &:focus-within,
      &:active {
        transition: ${(props) => props.theme.transition};
        outline: none;
        border-color: ${(props) => props.theme.colors.brand.primary};
        &::placeholder {
          color: transparent;
        }
      }
    `}

  ${compose(backgroundColor, background)}

  ${(props) =>
    props.isDisabled &&
    css`
      pointer-events: none;
      input {
        pointer-events: none;
      }
      opacity: 0.6; /* correct opacity on iOS */
      &::placeholder {
        color: ${(props) => props.theme.colors.text.disabled};
        opacity: 1;
      }
      &:hover {
        border-color: transparent;
      }
    `}

  ${(props) =>
    props.error &&
    css`
      border-color: ${props.theme.colors.ui.intent.alert};
      &:focus,
      &:focus-within,
      &:active {
        transition: ${(props) => props.theme.transition};
        outline: none;
        border-color: ${props.theme.colors.ui.intent.alert};
        &::placeholder {
          color: transparent;
        }
      }
    `}
`;

InputWrapper.defaultProps = {
  // pt: inputTokens.y,
  // pb: inputTokens.y,
  pl: 2,
  pr: 2,
  borderWidth: '1px',
  borderStyle: 'solid',
  borderRadius: 4,
  color: 'text.primary',
  // bg: 'bg.tertiary',
  mb: 0,
  hasPointerEvents: false,
  shouldHighlightOnFocus: true,
};

const ContentArea: any = styled(Text)<
  {
    hasLeftIcon: boolean;
    hasRightIcon: boolean;
    error?: boolean;
  } & TypographyFunctionsProps
>`
  display: block;
  pointer-events: all;
  width: 100%;
  appearance: none;
  outline: none;
  border: none;
  cursor: none;

  :invalid::-webkit-datetime-edit {
    color: ${(props) => props.theme.colors.text.placeholder};
  }

  ::-webkit-inner-spin-button,
  ::-webkit-calendar-picker-indicator {
    display: none;
    -webkit-appearance: none;
  }

  &::placeholder {
    color: ${(props) => rgba(props.theme.colors.text.placeholder, 0.25)};
  }

  &:disabled {
    -webkit-text-fill-color: currentColor; /* set text fill to current color for safari */
    opacity: 1; /* correct opacity on iOS */
    color: ${(props) => props.theme.colors.text.disabled};

    &::placeholder {
      color: ${(props) => rgba(props.theme.colors.text.disabled, 0.7)};
      opacity: 1;
    }
  }

  ${compose(space, layout, flexbox, border, position, color)}
`;

ContentArea.defaultProps = {
  pt: inputTokens.y,
  pb: inputTokens.y,
  color: 'text.primary',
  mb: 0,
};

const LeftIcon: any = styled(Box)<BoxProps & { disabled?: boolean }>`
  justify-self: flex-start;
  user-select: none;

  ${(props: any) =>
    props.interactive &&
    css`
      pointer-events: none;
      user-select: none;
    `}

  svg {
    display: block;
    font-size: ${(props) => props.theme.fontSizes[3]};
    color: ${(props: any) =>
      props.disabled
        ? props.theme.colors.text.disabled
        : props.theme.colors.text.primary};
  }
`;

const RightIcon: any = styled(Box)<
  BoxProps & { disabled?: boolean; interactive?: boolean }
>`
  justify-self: flex-end;
  user-select: none;
  ${(props) =>
    props.interactive &&
    css`
      pointer-events: none;
      user-select: none;
    `}
  svg {
    display: block;
    color: ${(props) =>
      props.disabled
        ? props.theme.colors.text.disabled
        : props.theme.colors.text.primary};
    font-size: ${(props) => props.theme.fontSizes[3]};
    ${(props) => props.disabled && { color: props.theme.colors.text.disabled }};
  }
`;

export type FullProps = InputProps & {
  wrapperRef?: any;
  wrapperStyle?: any;
  noCursor?: boolean;
  rows?: any;
};

export const Input: FC<FullProps> = forwardRef<HTMLInputElement, FullProps>(
  (props: FullProps, ref) => {
    const {
      as,
      leftIcon,
      leftLabel,
      leftInteractive,
      rightIcon,
      rightInteractive,
      flex,
      mb,
      mt,
      mx,
      my,
      ml,
      mr,
      noCursor,
      disabled,
      variant,
      borderColor,
      wrapperMotionProps,
      // eslint-disable-next-line @typescript-eslint/no-shadow
      color,
      bg,
      width,
      wrapperRef,
      wrapperStyle,
    } = props;

    return (
      <InputWrapper
        alignItems="center"
        position="relative"
        ref={wrapperRef}
        borderColor={borderColor}
        color={color}
        bg={bg}
        mx={mx}
        my={my}
        mb={mb}
        mt={mt}
        ml={ml}
        mr={mr}
        width={width}
        flex={flex}
        style={wrapperStyle}
        isDisabled={disabled}
        error={props.error}
        {...wrapperMotionProps}
      >
        {leftIcon && (
          <LeftIcon
            style={{ pointerEvents: leftInteractive ? 'auto' : 'none' }}
            mr={inputTokens.x}
            disabled={disabled}
          >
            {leftIcon}
          </LeftIcon>
        )}
        {leftLabel && leftLabel !== 'none' && (
          <Text color="#639DF6" fontWeight="bold" marginRight={2}>
            {leftLabel}
          </Text>
        )}
        <ContentArea
          as={as}
          variant={variant}
          ref={ref}
          hasLeftIcon={leftIcon}
          hasRightIcon={rightIcon}
          disabled={disabled}
          aria-invalid={props.error ? 'true' : 'false'}
          {...props}
          bg="transparent"
          style={{
            width: '100%',
            caretColor: noCursor ? 'transparent' : undefined,
          }}
        />
        {rightIcon && (
          <RightIcon
            style={{ pointerEvents: rightInteractive ? 'auto' : 'none' }}
            ml={inputTokens.x}
            disabled={disabled}
          >
            {rightIcon}
          </RightIcon>
        )}
      </InputWrapper>
    );
  }
);

Input.defaultProps = {
  error: false,
  leftInteractive: false,
  rightInteractive: false,
  type: 'text',
  variant: 'body',
  as: 'input',
  wrapperMotionProps: {
    transition: {
      background: { duration: 1 },
    },
  },
};
