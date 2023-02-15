import { KeyboardEventHandler } from 'react';
import { Flex, Box, Input } from 'renderer/components';

interface BigInputProps {
  m?: number | string;
  mt?: number | string;
  mb?: number | string;
  mx?: number | string;
  my?: number | string;
  placeholder: string;
  value: string;
  onChange: (value: any) => void;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}

export const BigInput = ({
  m,
  mt,
  mb,
  mx,
  my,
  placeholder,
  value,
  onKeyDown,
  onChange,
}: BigInputProps) => (
  <Flex
    m={m}
    mt={mt}
    mb={mb}
    mx={mx}
    my={my}
    flexDirection="row"
    alignItems="space-between"
    justifyContent="center"
  >
    <Box width={300} height={50}>
      <Input
        noCursor
        autoFocus
        spellCheck={false}
        textAlign="center"
        fontSize={24}
        fontWeight={500}
        placeholder={placeholder}
        value={value}
        // @ts-ignore
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </Box>
  </Flex>
);
