import { DayPicker } from 'react-day-picker';

import { Flex, Text } from '@holium/design-system';

import { log } from '../utils';

//import { format } from 'date-fns';

interface Props {
  onDatePickerSelect: (date: any) => void;
  datePickerSelected: any;
}
export const DatePicker = ({
  onDatePickerSelect,
  datePickerSelected,
}: Props) => {
  log('datePickerSelected', datePickerSelected);
  return (
    <Flex flexDirection="column">
      <Flex gap="5px">
        <Text.H5> Selected date:</Text.H5>
        <Text.H5 fontWeight={600}>{datePickerSelected?.toDateString()}</Text.H5>
      </Flex>
      <DayPicker
        mode="single"
        selected={datePickerSelected}
        onSelect={onDatePickerSelect}
        footer={null}
      />
    </Flex>
  );
};
