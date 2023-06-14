import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { Avatar, Box, Flex, Row, Text } from '@holium/design-system/general';
import { MenuItemProps } from '@holium/design-system/navigation';

import { useContextMenu } from 'renderer/components';
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

const PeerRowPresenter = ({ id, peer, options, role }: Props) => {
  const { getOptions, setOptions } = useContextMenu();

  const { friends } = useShipStore();

  useEffect(() => {
    if (options && options.length && options !== getOptions(id)) {
      setOptions(id, options);
    }
  }, [options, getOptions, id, setOptions]);

  const metadata = friends.getContactAvatarMetadata(peer);
  return (
    <Row id={id}>
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
            avatar={metadata.avatar}
            patp={metadata.patp}
            sigilColor={[metadata.color || '#000000', 'white']}
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
            {metadata.nickname ? metadata.nickname : metadata.patp}
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
export const PeerRow = observer(PeerRowPresenter);
