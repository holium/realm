import { useRef } from 'react';
import styled, { StyledComponentProps } from 'styled-components';

import { BoxProps, Flex } from '../../../general';
type InlineEditStyledProps = {
  offset: string;
  editable: boolean;
};
const InlineEditStyled = styled(Flex)<InlineEditStyledProps>`
  display: block;
  width: 100%;
  appearance: none;
  transition: var(--transition);
  background: transparent;

  border-radius: 6px;
  padding-left: 0px;
  border: none;

  ${(props) =>
    props.editable &&
    `
  &::placeholder {
    color: rgba(var(--rlm-text-rgba), 0.3);
  }

  &:hover {
    transition: var(--transition);
    padding-left: ${props.offset};
    background: rgba(var(--rlm-overlay-hover-rgba));
  }

  &:focus {
    outline: none;
    padding-left: ${props.offset};
    &::placeholder {
      color: transparent;
    }
    background: rgba(var(--rlm-overlay-active-rgba));
  }

  &:disabled {
    -webkit-text-fill-color: currentColor; /* set text fill to current color for safari */
    opacity: 0.5;
    color: rgba(var(--rlm-text-rgba), 0.3);
    background-color: transparent;
    border-color: transparent;

    &::placeholder {
      color: rgba(var(--rlm-text-rgba), 0.3);
      opacity: 1;
    }
  }
  `}
`;

type InlineEditProps = {
  id: string;
  error?: boolean;
  editable?: boolean;
  disabled?: boolean;
} & BoxProps &
  StyledComponentProps<'input', any, any, never>;

export const InlineEdit = ({
  id,
  editable = true,
  fontSize,
  fontWeight,
  textAlign,
  width,
  value,
  flex,
  mb,
  mt,
  mx,
  my,
  ml,
  mr,
  error = false,
  disabled,
  spellCheck = false,
  autoCapitalize = 'off',
  autoCorrect = 'off',
  onBlur,
  onChange,
}: InlineEditProps) => {
  const ref = useRef<HTMLInputElement>(null);

  const keypressHandler = (event: any) => {
    if (event.key === 'Enter') ref.current?.blur();
  };

  return (
    <InlineEditStyled
      as="input"
      alignItems="center"
      position="relative"
      pointerEvents={editable ? 'auto' : 'none'}
      editable={editable}
      mx={mx}
      my={my}
      mb={mb}
      mt={mt}
      ml={ml}
      mr={mr}
      flex={flex}
      id={id}
      name={id}
      ref={ref}
      py={2}
      spellCheck={spellCheck}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      offset={textAlign === 'center' ? '0px' : '8px'}
      fontSize={fontSize}
      disabled={disabled}
      aria-invalid={error ? 'true' : 'false'}
      onKeyDown={(event: any) => keypressHandler(event)}
      fontWeight={fontWeight}
      textAlign={textAlign}
      width={width as number}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
    />
  );
};
