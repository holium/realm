import { useEffect, useRef } from 'react';

import {
  Avatar,
  Box,
  Flex,
  MenuItemProps,
  Row,
  Text,
  useToggle,
} from '@holium/design-system';

import { useContextMenu } from 'renderer/components/ContextMenu';
import { useShipStore } from 'renderer/stores/ship.store';

import { usePassportMenu } from './usePassportMenu';

interface IPersonRow {
  listId: string;
  patp: string;
  shortPatp: string;
  contextMenuOptions?: MenuItemProps[];
  children?: any;
}

export const PersonRow = ({
  listId,
  patp,
  shortPatp,
  contextMenuOptions,
  children,
}: IPersonRow) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const { getOptions, setOptions } = useContextMenu();
  const { getMenuConfig, setMenuConfig } = usePassportMenu();
  const selected = useToggle(false);

  const { friends } = useShipStore();

  const id = `${listId}-${patp}`;
  const contact = friends.getContactAvatarMetadata(patp);

  useEffect(() => {
    if (getMenuConfig()?.id === id) {
      selected.toggleOn();
    } else {
      selected.toggleOff();
    }
  }, [getMenuConfig, setMenuConfig]);

  useEffect(() => {
    if (
      contextMenuOptions &&
      contextMenuOptions.length &&
      contextMenuOptions !== getOptions(id)
    ) {
      setOptions(id, contextMenuOptions);
    }
  }, [contextMenuOptions, getOptions, id, setOptions]);

  return (
    <Flex key={id} style={{ position: 'relative' }}>
      <Row
        id={id}
        ref={rowRef}
        onContextMenu={(evt: any) => {
          evt.stopPropagation();
        }}
        style={{ justifyContent: 'space-between' }}
        selected={selected.isOn}
        onClick={(evt) => {
          evt.stopPropagation();
          if (selected.isOn) {
            setMenuConfig(null);
          } else {
            setMenuConfig({
              id,
              contact,
              anchorPoint: {
                x: rowRef.current?.getBoundingClientRect().left || 0,
                y: rowRef.current?.getBoundingClientRect().top || 0,
              },
            });
          }
        }}
      >
        <Flex
          gap={10}
          flexDirection="row"
          alignItems="center"
          flex={1}
          maxWidth="100%"
          style={{ pointerEvents: 'none' }}
        >
          <Box>
            <Avatar
              simple
              size={22}
              avatar={contact.avatar}
              patp={patp}
              sigilColor={[contact.color || '#000000', 'white']}
            />
          </Box>
          <Flex flex={1} height="22px" overflow="hidden" alignItems="center">
            <Text.Custom
              fontSize={2}
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {contact.nickname ? contact.nickname : shortPatp}
            </Text.Custom>
          </Flex>
        </Flex>
        {children}
      </Row>
    </Flex>
  );
};
