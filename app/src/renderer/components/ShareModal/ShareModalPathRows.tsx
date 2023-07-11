import styled from 'styled-components';

import { Flex } from '@holium/design-system/general';

import { ShareModalPathRow } from './ShareModalPathRow';
import { useShareModal } from './useShareModal';

const ListContainer = styled(Flex)`
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
`;

export const ShareModalPathRows = () => {
  const { paths, setPaths } = useShareModal();

  return (
    <ListContainer>
      {paths.map((p) => (
        <ShareModalPathRow
          key={p.path}
          pathObj={p}
          toggle={(path: string, selected: boolean) => {
            setPaths(
              paths.map((i) => (i.path === path ? { ...i, selected } : i))
            );
          }}
        />
      ))}
    </ListContainer>
  );
};
