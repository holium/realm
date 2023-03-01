import { Flex, TextBlock } from '@holium/design-system';

export function TextNode({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <TextBlock
        id={data.id}
        by=""
        text=""
        reference={{ image: '', link: '' }}
      />
    </Flex>
  );
}
