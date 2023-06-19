import { Box, Flex, Text } from '../../../general';
import {
  InputBoxAdornment,
  InputBoxContainer,
  InputBoxContainerProps,
} from './InputBox.styles';

export type InputBoxProps = InputBoxContainerProps & {
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
  background = 'rgba(var(--rlm-input-rgba))',
  style,
  px,
  py,
  onClick,
  ...boxProps
}: InputBoxProps) => (
  <InputBoxContainer
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
    className="text-cursor"
    onClick={onClick}
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
    <Flex flex={1} flexDirection="row" alignItems="center" maxWidth="100%">
      {leftAdornment && (
        <InputBoxAdornment mr={1} disabled={disabled} alignContent="center">
          {leftAdornment}
        </InputBoxAdornment>
      )}
      {children}
      {rightAdornment && (
        <InputBoxAdornment ml={1} disabled={disabled} alignContent="center">
          {rightAdornment}
        </InputBoxAdornment>
      )}
    </Flex>
    {error && (
      <Box position="absolute" left={0} bottom={-18}>
        <Text.Hint color="intent-alert">{error}</Text.Hint>
      </Box>
    )}
  </InputBoxContainer>
);
