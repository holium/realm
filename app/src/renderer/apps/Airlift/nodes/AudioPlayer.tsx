import { Flex } from '@holium/design-system';

export function AudioPlayer({ data, isConnectable }) {
  return (
    <Flex border={data.showDelete ? '2px solid red' : 'none'}>
      <AudioPlayerBlock id={data.id} by={'by'} image="" />
    </Flex>
  );
}
