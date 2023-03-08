import { Flex, ToggleSwitch } from '@holium/design-system';

export function ToggleNode({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <ToggleSwitch id={data.id} text="" reference={{ image: '', link: '' }} />
    </Flex>
  );
}
