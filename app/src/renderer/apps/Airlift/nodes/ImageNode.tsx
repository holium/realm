import { Flex, ImageBlock } from '@holium/design-system';

export function ImageNode({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <ImageBlock id={data.id} by={'by'} image="" />
    </Flex>
  );
}
