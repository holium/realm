import { FC } from 'react';
import { Flex, Sigil } from 'renderer/components';
import { Patp } from 'os/types';

interface GroupSigilProps {
  path: string;
  patps: Patp[];
  metadata: any[];
}

export const GroupSigil: FC<GroupSigilProps> = (props: GroupSigilProps) => {
  const { path, patps, metadata } = props;
  const len = patps.length;
  const renderSigil = (data: any, index: number) => {
    return (
      <Sigil
        key={`${path}-sigil-${index}`}
        simple
        clickable={false}
        borderRadiusOverride="2px"
        size={18}
        avatar={data.avatar}
        patp={data.patp}
        color={[data.color || '#000000', 'white']}
      />
    );
  };
  let rowOne: any[] = [];
  let rowTwo: any[] = [];
  if (len === 2) {
    rowOne = [
      sigilInfo(patps[0], metadata[0]),
      sigilInfo(patps[1], metadata[1]),
    ];
  }
  if (len === 3) {
    rowOne = [sigilInfo(patps[0], metadata[0])];
    rowTwo = [
      sigilInfo(patps[1], metadata[1]),
      sigilInfo(patps[2], metadata[2]),
    ];
  }
  if (len >= 4) {
    rowOne = [
      sigilInfo(patps[0], metadata[0]),
      sigilInfo(patps[1], metadata[1]),
    ];
    rowTwo = [
      sigilInfo(patps[2], metadata[2]),
      sigilInfo(patps[3], metadata[3]),
    ];
  }
  if (len > 4) {
    // todo add +n
    let plusEl = <div>+ {len - 4}</div>;
  }
  return (
    <Flex
      gap={2}
      height={40}
      width={40}
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

const sigilInfo = (patp: Patp, metadata: any) => {
  return {
    patp,
    ...metadata,
  };
};
