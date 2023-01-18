import { FC } from 'react';
import { Flex, Box, Avatar } from '../../';

export type ContactData = {
  patp: string;
  nickname?: string;
  color: string;
  avatar?: string;
};

interface AvatarRowProps {
  people: ContactData[];
  size: number;
  borderRadiusOverride?: string;
  offset?: number;
}

export const AvatarRow: FC<AvatarRowProps> = ({
  people,
  size,
  borderRadiusOverride,
  offset = 6,
}: AvatarRowProps) => {
  return (
    <Flex ml={`${offset}px`} flexDirection="row" alignItems="center">
      {people.map((person: ContactData, index: number) => {
        return (
          <Box
            style={{
              clipPath:
                index === 0
                  ? 'none'
                  : `inset(0px 0px 0px ${offset + 1.2}px round 0px)`,
            }}
            key={`${person.patp} - ${index}`}
            ml={`-${offset}px`}
            zIndex={people.length - index}
          >
            <Avatar
              patp={person.patp}
              size={size}
              avatar={person.avatar}
              nickname={person.nickname}
              borderRadiusOverride={borderRadiusOverride}
              sigilColor={[person.color, '#FFF']}
              simple
            />
          </Box>
        );
      })}
    </Flex>
  );
};
