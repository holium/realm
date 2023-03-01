import { Flex, Button } from '@holium/design-system';

export function ButtonNode({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <Button.TextButton id={data.id} />
    </Flex>
  );
}
