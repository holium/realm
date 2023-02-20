import { FC } from 'react';
import { Flex } from 'renderer/components';
import { Patp } from 'os/types';
import { Avatar } from '@holium/design-system';
import { useServices } from 'renderer/logic/store';

interface GroupSigilProps {
  path: string;
  patps: Patp[];
}

export const GroupSigil: FC<GroupSigilProps> = (props: GroupSigilProps) => {
  const { path, patps } = props;
  const { friends } = useServices();

  const len = patps.length;
  const renderSigil = (data: any, index: number) => {
    const {
      patp,
      avatar,
      color: sigilColor,
    } = friends.getContactAvatarMetadata(data);
    return (
      <Avatar
        key={`${path}-sigil-${index}`}
        simple
        clickable={false}
        borderRadiusOverride="2px"
        size={16}
        avatar={avatar}
        patp={patp}
        sigilColor={[sigilColor || '#000000', 'white']}
      />
    );
  };
  let rowOne: any[] = [];
  let rowTwo: any[] = [];
  if (len === 2) {
    rowOne = [patps[0], patps[1]];
  }
  if (len === 3) {
    rowOne = [patps[0]];
    rowTwo = [patps[1], patps[2]];
  }
  if (len >= 4) {
    rowOne = [patps[0], patps[1]];
    rowTwo = [patps[2], patps[3]];
  }
  if (len > 4) {
    // todo add +n
  }
  return (
    <Flex
      gap={2}
      height={36}
      width={36}
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Flex gap={2} flex={2} justifyContent="center" alignItems="center">
        {rowOne.map(renderSigil)}
      </Flex>
      {rowTwo.length > 0 && (
        <Flex gap={2} flex={2} justifyContent="center" alignItems="center">
          {rowTwo.map(renderSigil)}
        </Flex>
      )}
    </Flex>
  );
};
