import { FC } from 'react';
import { Flex, Sigil } from 'renderer/components';
import { useServices } from 'renderer/logic/store';

interface AvatarRowProps {
  people: string[];
  backgroundColor: string;
}

export const AvatarRow: FC<AvatarRowProps> = (props: AvatarRowProps) => {
  const { people, backgroundColor } = props;
  const { ship } = useServices();

  return (
    <Flex flexDirection="row" alignItems="center">
      {people.map((person: string, index: number) => {
        const metadata = ship?.contacts.getContactAvatarMetadata(person);
        return (
          <Flex key={person} ml="-12px" zIndex={people.length - index}>
            <Sigil
              borderColor={backgroundColor}
              borderRadiusOverride="6px"
              simple
              size={26}
              avatar={metadata && metadata.avatar}
              patp={person}
              color={[(metadata && metadata.color) || '#000000', 'white']}
            />
          </Flex>
        );
      })}
    </Flex>
  );
};
