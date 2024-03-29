import { observer } from 'mobx-react';

import { Avatar, Box, Flex } from '@holium/design-system/general';

import { useShipStore } from 'renderer/stores/ship.store';

interface AvatarRowProps {
  people: string[];
  backgroundColor: string;
}

const AvatarRowPresenter = ({ people }: AvatarRowProps) => {
  const { friends } = useShipStore();

  return (
    <Flex flexDirection="row" alignItems="center">
      {people.map((person: string, index: number) => {
        const metadata = friends.getContactAvatarMetadata(person);
        return (
          <Box
            style={{
              clipPath:
                index === 0 ? 'none' : 'inset(0px 0px 0px 8px round 0px)',
            }}
            key={person}
            ml="-6px"
            zIndex={people.length - index}
          >
            <Avatar
              // borderColor={backgroundColor}
              borderRadiusOverride="4px"
              simple
              size={22}
              avatar={metadata && metadata.avatar}
              patp={person}
              sigilColor={[(metadata && metadata.color) || '#000000', 'white']}
            />
          </Box>
        );
      })}
    </Flex>
  );
};

export const AvatarRow = observer(AvatarRowPresenter);
