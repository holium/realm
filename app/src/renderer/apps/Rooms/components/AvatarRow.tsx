import { Avatar } from '@holium/design-system';
import { FC } from 'react';
import { Flex, Box, Sigil } from 'renderer/components';
import { useServices } from 'renderer/logic/store';

interface AvatarRowProps {
  people: string[];
  backgroundColor: string;
}

export const AvatarRow: FC<AvatarRowProps> = (props: AvatarRowProps) => {
  const { people, backgroundColor } = props;
  const { ship, contacts } = useServices();

  return (
    <Flex flexDirection="row" alignItems="center">
      {people.map((person: string, index: number) => {
        const metadata = contacts.getContactAvatarMetadata(person);
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
              borderColor={backgroundColor}
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
