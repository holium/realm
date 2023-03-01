import { Flex, MemeBlock } from '@holium/design-system';

export function MemeNode({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <MemeBlock id={data.id} by={'by'} image={''} />
    </Flex>
  );
}
