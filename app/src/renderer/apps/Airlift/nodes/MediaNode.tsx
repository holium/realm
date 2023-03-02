import { Flex, MediaBlock } from '@holium/design-system';

export function MediaNode({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <MediaBlock
        id={data.id}
        mode="display"
        width={500}
        url="https://www.youtube.com/watch?v=CKSic699N3E"
      />
    </Flex>
  );
}
