import { DayPicker } from 'react-day-picker';
import { createGlobalStyle } from 'styled-components';

import { Flex, SectionDivider } from '@holium/design-system';

//import { format } from 'date-fns';

const PickerStyles = createGlobalStyle`
  .rdp {
    --rdp-cell-size: 35px;
    --rdp-outline: 1px solid  rgba(var(--rlm-accent-rgba)); /* Outline border for focused elements */
    --rdp-outline-selected: 1px solid  rgba(var(--rlm-accent-rgba)); /* Outline border for focused _and_ selected elements */
    color: rgba(var(--rlm-text-rgba));
  }
  .rdp-caption_label {
    font-size: 14px;
  }
  .rdp-head_cell {
    color: rgba(var(--rlm-text-rgba) , .7);
    font-weight: 600;
    font-size: 12px;
  }
  .rdp-day {
    font-size: 12px;
    border-radius: 10px;

  }
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
    /* Reset hover of daypicker element to be realm txt color */
    color: rgba(var(--rlm-text-rgba));
    background-color: transparent;
  }
  
.rdp-nav_button {
  /* Reset chevron left and right button */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0px;
  border-radius: 100%;
}
.rdp-nav_icon {
  /* Reset chevron left and right icon color */
  color: rgba(var(--rlm-icon-rgba));
}

.my-today { 
  font-weight: 600; 
  color: rgba(var(--rlm-accent-rgba));
}
.rdp-day_selected,
.rdp-day_selected:focus-visible,
.rdp-day_selected:hover {
  font-weight: 600; 
  background-color: rgba(var(--rlm-accent-rgba), .12);
  color: rgba(var(--rlm-accent-rgba), 1);
  border-radius: 4px;
}

.rdp-day_selected:focus-visible {
  /* Since the background is the same use again the outline */
  outline: var(--rdp-outline);
  outline-offset: 2px;
  z-index: 1;
}
.rdp-button:focus-visible:not([disabled]) {
  /* When focusing on an element */
  color: inherit;
  background-color: rgba(var(--rlm-accent-rgba), .12);
  border: var(--rdp-outline);
}

`;
interface Props {
  onDatePickerSelect: (date: any) => void;
  datePickerSelected: any;
}

export const DatePicker = ({
  onDatePickerSelect,
  datePickerSelected,
}: Props) => {
  return (
    <Flex flexDirection="column">
      <PickerStyles />
      <SectionDivider label="" alignment="left" />

      <DayPicker
        mode="single"
        modifiersClassNames={{
          rdp: 'rdp',
          today: 'my-today',
        }}
        modifiersStyles={{ head_row: { color: 'orange' } }}
        selected={datePickerSelected}
        onSelect={onDatePickerSelect}
        footer={null}
        showOutsideDays
      />
    </Flex>
  );
};
