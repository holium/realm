import { useState } from 'react';
import { Popover } from 'react-tiny-popover';

import { Box, Button, Card, Flex, Icon, Text } from '@holium/design-system';

import { api } from '../api';
import {
  formatHoursMinutes,
  getDayOfWeekJS,
  getMonthAndDay,
  log,
  reccurenceRuleToReadable,
} from '../utils';
// TODO: add reccurence text
export const Event = ({ eventInfo }: any) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [deletePrompt, setDeletePrompt] = useState<boolean>(false);
  // TODO: optimize this
  const title = eventInfo.event.title;
  const description = eventInfo.event['_def']?.extendedProps.description;
  const color = eventInfo.event['_def']?.extendedProps._color;
  const startDate = eventInfo.event['_def']?.extendedProps._startDate;
  const endDate = eventInfo.event['_def']?.extendedProps._endDate;
  const calendarId = eventInfo.event['_def']?.extendedProps._calendarId;
  const spanId = eventInfo.event['_def']?.extendedProps._spanId;
  const instanceId = eventInfo.event['_def']?.extendedProps._instanceId;
  const reccurenceRule = eventInfo.event['_def']?.extendedProps._reccurenceRule;

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
  const normalPopoverContent = () => {
    return (
      <Card elevation={3} padding={3} width={'400px'} height="180px">
        <Flex flexDirection={'row'}>
          <Flex flexDirection={'column'} gap="5px" flex={1}>
            <Text.H6 fontWeight={600}>{title}</Text.H6>
            <Flex>
              <Box marginRight={'10px'}>
                <Text.Body>{startWeekMonthDate} </Text.Body>
              </Box>
              <Flex gap="2px">
                <Text.Body>{formatHoursMinutes(startDate)}</Text.Body>
                <Text.Body>-</Text.Body>
                <Text.Body>{formatHoursMinutes(endDate)}</Text.Body>
              </Flex>
            </Flex>
            <Text.Body>{reccurenceRuleToReadable(reccurenceRule)}</Text.Body>
            <Box>
              <Text.Body>{description}</Text.Body>
            </Box>
          </Flex>
          <Flex minWidth={50}>
            <Button.IconButton size={28} onClick={() => setDeletePrompt(true)}>
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
      </Card>
    );
  };
  const deletePopoverContent = () => {
    return (
      <Card elevation={3} padding={3} width={'400px'} height="180px">
        <Flex flexDirection={'row'}>
          <Flex flexDirection={'column'} gap="5px" flex={1}>
            <Button.TextButton
              showOnHover
              onClick={(evt) => {
                evt.stopPropagation();
                deleteSpanInstance();
              }}
            >
              Delete instance
            </Button.TextButton>
            <Button.TextButton
              showOnHover
              onClick={(evt) => {
                evt.stopPropagation();
                deleteSpan();
              }}
            >
              Delete event
            </Button.TextButton>
            <Button.TextButton
              showOnHover
              onClick={(evt) => {
                evt.stopPropagation();
                setDeletePrompt(false);
              }}
            >
              Cancel
            </Button.TextButton>
          </Flex>
          <Flex minWidth={50}>
            <Button.IconButton size={28} onClick={() => setDeletePrompt(false)}>
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
      </Card>
    );
  };
  return (
    <Popover
      isOpen={isPopoverOpen}
      positions={['left', 'right', 'top', 'bottom']} // preferred positions by priority
      align={'start'}
      onClickOutside={() => setIsPopoverOpen(false)} // handle click events outside of the popover/target here!
      content={deletePrompt ? deletePopoverContent() : normalPopoverContent()}
    >
      {/* Custom event component */}
      <Box
        style={{
          padding: 2,
          background: color ? color : 'rgba(var(--rlm-accent-rgba), .5)',
          color: 'rgba(var(--rlm-text-rgba))',
        }}
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
