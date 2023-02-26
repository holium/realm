import { Flex } from '@holium/design-system';

export function WalletNode({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <label htmlFor="text">Text:</label>
    </Flex>
  );
}
