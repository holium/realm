import { Flex, TextInput } from '@holium/design-system';

export function TextInputNode({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <TextInput id={data.id} name={data.id} />
    </Flex>
  );
}
