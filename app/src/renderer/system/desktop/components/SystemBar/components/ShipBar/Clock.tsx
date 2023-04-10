import { useEffect, useState } from 'react';
import moment from 'moment';
import { Flex, Text } from '@holium/design-system';

export const TrayClock = () => {
  const [time, setTime] = useState(() => moment().format('hh:mm A'));
  const [date, setDate] = useState(() => moment().format('ddd MMM YY'));
  useEffect(() => {
    function initClock() {
      let interval = (60 - new Date().getSeconds()) * 1000 + 5;
      setTime(moment().format('ddd MMM DD'));
      setDate(moment().format('hh:mm A'));
      setTimeout(initClock, interval);
    }
    initClock();
    return () => {};
  }, []);
  return (
    <Flex
      width="fit-content"
      gap={1}
      flexDirection="column"
      alignItems="flex-end"
    >
      <Text.Custom
        style={{ whiteSpace: 'nowrap', userSelect: 'none' }}
        fontSize="12px"
        fontWeight={300}
      >
        {date}
      </Text.Custom>
      <Text.Custom
        textAlign="right"
        style={{ whiteSpace: 'nowrap', userSelect: 'none' }}
        fontWeight={300}
        fontSize="12px"
      >
        {time}
      </Text.Custom>
    </Flex>
  );
};
