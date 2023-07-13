import styled from 'styled-components';

import { Bubble } from '@holium/design-system/blocks';
import { Flex } from '@holium/design-system/general';

import { useShareModal } from './useShareModal';

const BubbleWrapper = styled(Flex)`
  flex: 1;
  padding: 0 8px;

  span.bubble-fragment {
    /* truncate after 3 lines */
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Hide all span.bubble-fragment except the first one */
  span.bubble-fragment ~ span.bubble-fragment {
    display: none;
  }

  /* Set images to a max-height of 150px */
  span.bubble-fragment img {
    max-height: 150px;
    object-fit: contain;
  }
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
