import { FC } from 'react';
import { Flex, Text } from 'renderer/components';

export const TrayClock: FC<any> = (props: any) => {
  return (
    <Flex width={66} flexDirection="column" alignItems="flex-end">
      <Text
        flex={1}
        textAlign="right"
        style={{ wordBreak: 'keep-all' }}
        fontSize="13px"
      >
        06:10 AM
      </Text>
      <Text fontSize="13px">07/06/22</Text>
    </Flex>
  );
};
