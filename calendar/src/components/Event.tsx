import { useState } from 'react';
import { Popover } from 'react-tiny-popover';

import { Box, Button, Card, Flex, Icon, Text } from '@holium/design-system';

import { api } from '../api';
import useCalendarStore, { CalendarStore } from '../CalendarStore';
import {
  formatHoursMinutes,
  getDayOfWeekJS,
  getMonthAndDay,
  log,
  reccurenceRuleParse,
} from '../utils';
// TODO: add reccurence text
export const Event = ({ eventInfo }: any) => {
  const publicCalendarId = useCalendarStore(
    (store: CalendarStore) => store.publicCalendarId
  ); // If this exist we're in a clearweb calendar view, we disable interactions
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
  // const isFullDay = eventInfo.event['_def']?.extendedProps._isFullday;

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
        parseInt(instanceId)
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
                {endDate && (
                  <>
                    <Text.Body>-</Text.Body>
                    <Text.Body>{formatHoursMinutes(endDate)}</Text.Body>
                  </>
                )}
              </Flex>
            </Flex>
            <Text.Body>{reccurenceRuleParse(reccurenceRule).display}</Text.Body>

            <Box>
              <Text.Body>{description}</Text.Body>
            </Box>
          </Flex>
          <Flex minWidth={50}>
            {/*  <Button.IconButton
              size={28}
              onClick={() => {
                setIsEditingInstance(true);

                setEditingData({
                  title,
                  description,
                  color,
                  startDate,
                  endDate,
                  calendarId,
                  spanId,
                  instanceId,
                  reccurenceRule,
                  isFullDay,
                });
                setIsPopoverOpen(false);
              }}
            >
              <Icon name="Edit" size={16} opacity={0.7} />
            </Button.IconButton>*/}
            <Button.IconButton size={28} onClick={() => setDeletePrompt(true)}>
              {!publicCalendarId && (
                <Icon name="Trash" size={16} opacity={0.7} />
              )}
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
            {reccurenceRuleParse(reccurenceRule).reccurenceTypeOption ===
            'noRepeat' ? (
              <Button.TextButton
                showOnHover
                onClick={(evt) => {
                  evt.stopPropagation();
                  deleteSpan();
                }}
              >
                Delete Event
              </Button.TextButton>
            ) : (
              <>
                <Button.TextButton
                  showOnHover
                  onClick={(evt) => {
                    evt.stopPropagation();
                    deleteSpanInstance();
                  }}
                >
                  Delete this instance
                </Button.TextButton>
                <Button.TextButton
                  showOnHover
                  onClick={(evt) => {
                    evt.stopPropagation();
                    deleteSpan();
                  }}
                >
                  Delete all instances
                </Button.TextButton>
              </>
            )}

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
              onClick={() => {
                // Make sure we leave delete prompt if we were there
                setDeletePrompt(false);
                setIsPopoverOpen(false);
              }}
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
      <Flex
        style={{
          padding: 2,
          background: color ? color : 'rgba(var(--rlm-accent-rgba), .5)',
          color: 'rgba(var(--rlm-text-rgba))',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
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
        gap="5px"
      >
        <Text.Body fontWeight={600} style={{ textOverflow: 'ellipsis' }}>
          {eventInfo.timeText}
        </Text.Body>
        <Text.Body style={{ textOverflow: 'ellipsis' }}>
          {eventInfo.event.title}
        </Text.Body>
      </Flex>
    </Popover>
  );
};
