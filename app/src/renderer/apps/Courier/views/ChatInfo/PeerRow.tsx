import { useEffect, useRef } from 'react';

import { Avatar, Box, Flex, Row, Text } from '@holium/design-system/general';
import { MenuItemProps } from '@holium/design-system/navigation';
import { useToggle } from '@holium/design-system/util';

import { useContextMenu } from 'renderer/components';
import { usePassportMenu } from 'renderer/components/People/usePassportMenu';
import { useShipStore } from 'renderer/stores/ship.store';

type Props = {
  id: string;
  peer: string;
  role: string;
  options?: MenuItemProps[];
};

const LabelMap = {
  host: 'host',
  admin: 'admin',
};

export const PeerRow = ({ id, peer, options, role }: Props) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const { getOptions, setOptions } = useContextMenu();
  const { getMenuConfig, setMenuConfig } = usePassportMenu();
  const selected = useToggle(false);

  const { friends } = useShipStore();

  const contact = friends.getContactAvatarMetadata(peer);

  useEffect(() => {
    if (getMenuConfig()?.id === id) {
      selected.toggleOn();
    } else {
      selected.toggleOff();
    }
  }, [getMenuConfig, setMenuConfig]);

  useEffect(() => {
    if (options && options.length && options !== getOptions(id)) {
      setOptions(id, options);
    }
  }, [options, getOptions, id, setOptions]);

  return (
    <Row
      id={id}
      ref={rowRef}
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
            patp={contact.patp}
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
            {contact.nickname ? contact.nickname : contact.patp}
          </Text.Custom>
        </Flex>
        {(role === 'host' || role === 'admin') && (
          <Text.Custom fontSize={2} opacity={0.5}>
            {LabelMap[role]}
          </Text.Custom>
        )}
      </Flex>
    </Row>
  );
};
// export const PeerRow = observer(PeerRowPresenter);
