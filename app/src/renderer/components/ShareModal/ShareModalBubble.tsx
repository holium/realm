import styled from 'styled-components';

import { Bubble } from '@holium/design-system/blocks';
import { Flex } from '@holium/design-system/general';

import { useShareModal } from './useShareModal';

const BubbleWrapper = styled(Flex)`
  margin: 0 8px;
  max-height: 100px;
  overflow: hidden;
`;

export const ShareModalBubble = () => {
  const { object } = useShareModal();

  if (!object || !object.message) return null;

  return (
    <BubbleWrapper>
      <Bubble
        id={`message-row-${object.message.id}`}
        isPrevGrouped={false}
        isNextGrouped={false}
        expiresAt={object.message.expiresAt}
        themeMode="light"
        isOur={false}
        ourColor="black"
        isEditing={false}
        isDeleting={false}
        updatedAt={object.message.updatedAt}
        isEdited={object.message.metadata.edited}
        author={object.message.sender}
        message={object.mergedContents}
        sentAt={new Date(object.message.createdAt).toISOString()}
        error={object.message.error}
      />
    </BubbleWrapper>
  );
};
