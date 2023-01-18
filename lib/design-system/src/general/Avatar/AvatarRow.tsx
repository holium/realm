import { FC } from 'react';
import { Flex, Box, Avatar } from '../../';

export type ContactData = {
  patp: string;
  nickname?: string;
  color: string;
  avatar?: string;
};

interface AvatarRowProps {
  direction?: 'horizontal' | 'vertical';
  people: ContactData[];
  size: number;
  borderRadiusOverride?: string;
  offset?: number;
}

export const AvatarRow: FC<AvatarRowProps> = ({
  people,
  direction = 'horizontal',
  size,
  borderRadiusOverride,
  offset = 6,
}: AvatarRowProps) => {
  const directionStyle: any =
    direction === 'horizontal'
      ? { flexDirection: 'row', ml: `${offset}px` }
      : { flexDirection: 'column', mt: `${offset}px` };
  return (
    <Flex {...directionStyle} alignItems="center">
      {people.map((person: ContactData, index: number) => {
        let offsetStyle: any = {
          marginLeft: `-${offset}px`,
          clipPath:
            index === 0
              ? 'none'
              : `inset(0px 0px 0px ${offset + 1.2}px round 0px)`,
        };
        if (direction === 'vertical') {
          offsetStyle = {
            marginTop: `-${offset}px`,
            clipPath:
              index === 0
                ? 'none'
                : `inset(${offset + 1.2}px 0px 0px 0px round 0px)`,
          };
        }
        return (
          <Box
            style={offsetStyle}
            key={`${person.patp} - ${index}`}
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
