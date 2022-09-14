import {FC} from 'react';
import {Flex, Box, Input} from 'renderer/components';

interface BigInputProps {
  m?: number | string
  mt?: number | string
  mb?: number | string
  mx?: number | string
  my?: number | string
  placeholder: string
  value: string
  onChange: any
}

export const BigInput: FC<BigInputProps> = (props: BigInputProps) => {
  let { m, mt, mb, mx, my } = props;

  return (
    <Flex m={m} mt={mt} mb={mb} mx={mx} my={my} flexDirection="row" alignItems="space-between" justifyContent="center">
      <Box width={300} height={50}>
        <Input noCursor autoFocus
          spellCheck={false}
          textAlign="center"
          fontSize={24}
          fontWeight={500}
          placeholder={props.placeholder}
          value={props.value} onChange={(e) => props.onChange(e.target.value)} />
      </Box>
    </Flex>
  )
}
