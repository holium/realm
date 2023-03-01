import { Flex, LinkBlock } from '@holium/design-system';

export function LinkNode({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <LinkBlock
        id={data.id}
        link={/*data.link*/ 'https://www.google.com/'}
        by={'by'}
      />
    </Flex>
  );
}
