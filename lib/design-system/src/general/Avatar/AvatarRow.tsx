import { CSSProperties } from 'react';

import { Box } from '../Box/Box';
import { Flex } from '../Flex/Flex';
import { Avatar } from './Avatar';

export type ContactData = {
  patp: string;
  nickname?: string;
  color: string;
  avatar?: string;
};

type Props = {
  direction?: 'horizontal' | 'vertical';
  people: ContactData[];
  size: number;
  borderRadiusOverride?: string;
  offset?: number;
};

export const AvatarRow = ({
  people,
  direction = 'horizontal',
  size,
  borderRadiusOverride,
  offset = 6,
}: Props) => {
  const directionStyle: CSSProperties =
    direction === 'horizontal'
      ? { flexDirection: 'row', marginLeft: `${offset}px` }
      : { flexDirection: 'column', marginTop: `${offset}px` };

  return (
    <Flex align="center" style={directionStyle}>
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
            key={`${person.patp} - ${index}`}
            style={{
              zIndex: people.length - index,
              ...offsetStyle,
            }}
          >
            <Avatar
              patp={person.patp}
              size={size}
              avatar={person.avatar}
              borderRadiusOverride={borderRadiusOverride}
              sigilColor={[person.color, '#FFF']}
              simple={true}
            />
          </Box>
        );
      })}
    </Flex>
  );
};
