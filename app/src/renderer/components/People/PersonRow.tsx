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

import { usePassportMenu } from './usePassportMenu';

interface IPersonRow {
  listId: string;
  patp: string;
  shortPatp: string;
  sigilColor?: string | null;
  avatar?: string | null;
  nickname?: string | null;
  description?: string | null;
  contextMenuOptions?: MenuItemProps[];
  children?: any;
}

export const PersonRow = ({
  listId,
  patp,
  shortPatp,
  sigilColor,
  avatar,
  nickname,
  description,
  contextMenuOptions,
  children,
}: IPersonRow) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const { getOptions, setOptions } = useContextMenu();
  const { getMenuConfig, setMenuConfig } = usePassportMenu();
  const selected = useToggle(false);

  const id = `${listId}-${patp}`;

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
          console.log(selected.isOn);
          if (selected.isOn) {
            setMenuConfig(null);
          } else {
            setMenuConfig({
              id,
              options: {
                patp,
                sigilColor,
                avatar,
                nickname,
                description,
              },
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
              avatar={avatar}
              patp={patp}
              sigilColor={[sigilColor || '#000000', 'white']}
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
              {nickname ? nickname : shortPatp}
            </Text.Custom>
          </Flex>
        </Flex>
        {children}
      </Row>
    </Flex>
  );
};
