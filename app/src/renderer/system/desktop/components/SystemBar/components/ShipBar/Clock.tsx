import { FC, useMemo } from 'react';
import moment from 'moment';
import { Flex, Text } from 'renderer/components';

export const TrayClock: FC<any> = (props: any) => {
  const time = useMemo(() => moment().format('hh:mm A'), []);
  const date = useMemo(() => moment().format('MM/DD/YY'), []);
  return (
    <Flex width="fit-content" flexDirection="column" alignItems="flex-end">
      <Text textAlign="right" style={{ whiteSpace: 'nowrap' }} fontSize="13px">
        {time}
      </Text>
      <Text fontSize="13px">{date}</Text>
    </Flex>
  );
};
