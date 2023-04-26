import { useRef } from 'react';
import { StyledComponentProps } from 'styled-components';

import { BoxProps, Flex } from '../../../general';
import { TextInput } from '../TextInput/TextInput';

type InlineEditProps = {
  id: string;
  error?: boolean;
  disabled?: boolean;
} & BoxProps &
  StyledComponentProps<'input', any, any, never>;

export const InlineEdit = ({
  id,
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
  onBlur,
  onChange,
}: InlineEditProps) => {
  const ref = useRef<HTMLInputElement>(null);

  const keypressHandler = (event: any) => {
    if (event.key === 'Enter') ref.current?.blur();
  };

  return (
    <Flex
      alignItems="center"
      position="relative"
      mx={mx}
      my={my}
      mb={mb}
      mt={mt}
      ml={ml}
      mr={mr}
      flex={flex}
    >
      <TextInput
        id={id}
        name={id}
        ref={ref}
        py={2}
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
    </Flex>
  );
};
