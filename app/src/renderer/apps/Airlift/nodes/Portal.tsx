import { Flex } from '@holium/design-system';

export function Portal({ data, isConnectable }) {
  return <Flex border={data.showDelete ? '2px solid red' : 'none'}></Flex>;
}
