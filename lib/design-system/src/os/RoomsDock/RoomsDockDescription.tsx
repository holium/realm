import { Flex, Icon, Text } from '../../../general';
import { pluralize } from '../../../util';
import { AvatarRow, ContactData } from '../../general/Avatar/AvatarRow';

type Props = {
  live: any;
  rooms: any[];
  participants: ContactData[];
};

export const RoomsDockDescription = ({ live, rooms, participants }: Props) => {
  if (!live) {
    return (
      <Flex pointerEvents="none" gap={12} align="center">
        <Icon name="Connect" size={20} />
        <Flex>
          {rooms.length > 0 ? (
            <Text.Custom fontSize={2}>
              {rooms.length} {pluralize('room', rooms.length)}
            </Text.Custom>
          ) : (
            <Text.Custom fontSize={2} opacity={0.7}>
              No rooms
            </Text.Custom>
          )}
        </Flex>
      </Flex>
    );
  }

  console.log('present: %o', live.present);
  return (
    <Flex pointerEvents="none" style={{ flexDirection: 'column' }} gap={1}>
      <Text.Custom
        fontWeight={500}
        fontSize={1}
        width={148}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'left',
        }}
      >
        {live.title}
      </Text.Custom>
      <Flex gap={6} align="center">
        <AvatarRow
          people={participants}
          size={13}
          borderRadiusOverride={'2px'}
          offset={2}
        />
        <Text.Hint
          opacity={0.7}
        >{`${live.present.length}/${live.capacity}`}</Text.Hint>
      </Flex>
    </Flex>
  );
};
