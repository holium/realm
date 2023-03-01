import { Flex, MediaBlock } from '@holium/design-system';

export function MediaNode({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <MediaBlock id={data.id} url={'google.com'} />
    </Flex>
  );
}
