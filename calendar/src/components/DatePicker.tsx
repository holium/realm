import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
//import { format } from 'date-fns';

export const DatePicker = () => {
  const [selected, setSelected] = useState<Date>();

  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={setSelected}
      footer={null}
    />
  );
};
