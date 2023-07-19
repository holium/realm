import { useState } from 'react';
import { Popover } from 'react-tiny-popover';

import {
  Box,
  Button,
  Card,
  Flex,
  Icon,
  Select,
  Text,
} from '@holium/design-system';

import { api } from '../api';
import {
  formatHoursMinutes,
  getDayOfWeekJS,
  getMonthAndDay,
  log,
} from '../utils';
// TODO: add reccurence text
export const Event = ({ eventInfo }: any) => {
  const [selectedInteractionType, setSelectedInteractionType] =
    useState<string>('span');
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  // TODO: optimize this
  const title = eventInfo.event.title;
  const description = eventInfo.event['_def']?.extendedProps.description;
  const startDate = eventInfo.event['_def']?.extendedProps._startDate;
  const endDate = eventInfo.event['_def']?.extendedProps._endDate;
  const calendarId = eventInfo.event['_def']?.extendedProps._calendarId;
  const spanId = eventInfo.event['_def']?.extendedProps._spanId;
  const instanceId = eventInfo.event['_def']?.extendedProps._instanceId;
  const startWeekMonthDate =
    getDayOfWeekJS(startDate.getDay()) + ', ' + getMonthAndDay(startDate);

  const deleteSpan = async () => {
    try {
      const result = await api.deleteSpan(calendarId, spanId);
      log('deleteSpan result => ', result);
    } catch (e) {
      log('deleteSpan error => ', e);
    }
  };
  const deleteSpanInstance = async () => {
    log('spanId', spanId);
    try {
      const result = await api.deleteSpanInstance(
        calendarId,
        spanId,
        parseInt(instanceId),
        title,
        description
      );
      log('deleteSpanInstance result => ', result);
    } catch (e) {
      log('deleteSpanInstance error => ', e);
    }
  };
  return (
    <Popover
      isOpen={isPopoverOpen}
      positions={['left', 'right', 'top', 'bottom']} // preferred positions by priority
      align={'start'}
      onClickOutside={() => setIsPopoverOpen(false)} // handle click events outside of the popover/target here!
      content={
        <Card elevation={3} padding={3} width={'400px'} height="200px">
          <Flex justifyContent={'flex-end'}></Flex>
          <Flex flexDirection={'column'} gap="5px">
            <Flex
              flexDirection={'row'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Text.H6 fontWeight={600}>{title}</Text.H6>
              <Flex>
                <Button.IconButton
                  size={28}
                  onClick={() =>
                    selectedInteractionType === 'span'
                      ? deleteSpan()
                      : deleteSpanInstance()
                  }
                >
                  <Icon name="Trash" size={16} opacity={0.7} />
                </Button.IconButton>
                <Button.IconButton
                  size={28}
                  onClick={() => setIsPopoverOpen(false)}
                >
                  <Icon name="Close" size={22} opacity={0.7} />
                </Button.IconButton>
              </Flex>
            </Flex>
            <Flex>
              <Box marginRight={'10px'}>
                <Text.Body>{startWeekMonthDate}</Text.Body>
              </Box>
              <Flex gap="2px">
                <Text.Body>{formatHoursMinutes(startDate)}</Text.Body>
                <Text.Body>-</Text.Body>
                <Text.Body>{formatHoursMinutes(endDate)}</Text.Body>
              </Flex>
            </Flex>
            <Text.Body>repeat rule goes here</Text.Body>
          </Flex>
          <Box marginTop="10px">
            <Text.Body>{description}</Text.Body>
          </Box>
          <Box marginTop={'auto'} width="80px">
            <Select
              placeholder="Type"
              id="event-interaction-type-select"
              options={[
                { value: 'span', label: 'span' },
                { value: 'instance', label: 'instance' },
              ]}
              selected={selectedInteractionType}
              onClick={(type) => {
                setSelectedInteractionType(type as string);
              }}
            />
          </Box>
        </Card>
      }
    >
      <Box
        flex={1}
        padding={0}
        margin={0}
        width={'100%'}
        height={'100%'}
        onClick={() => {
          setIsPopoverOpen(!isPopoverOpen);
        }}
        // TODO: stop overflow of text with ...
      >
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
      </Box>
    </Popover>
  );
};
