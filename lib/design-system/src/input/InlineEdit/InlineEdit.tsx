import { useRef, useState } from 'react';
import { StyledComponentProps } from 'styled-components';

import { BoxProps, Flex, Text } from '../../../general';
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
  const [hovering, setHovering] = useState(false);
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
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {hovering ? (
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
      ) : (
        <Text.Default pt="17px" pb="16px">
          {value}
        </Text.Default>
      )}
    </Flex>
  );
};
