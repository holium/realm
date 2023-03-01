import { Flex } from '@holium/design-system';

export function Node3D({ data, isConnectable }) {
  return <Flex border={data.showDelete ? '2px solid red' : 'none'}></Flex>;
}
