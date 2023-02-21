import { isValidPatp } from 'urbit-ob';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Avatar, Box, Button, Icon } from '@holium/design-system';

import { GroupSigil } from '../components/GroupSigil';
import { useServices } from 'renderer/logic/store';
import { useState } from 'react';

type ChatAvatarProps = {
  title: string;
  type: string;
  path: string;
  image?: string;
  canEdit?: boolean;
  size?: number;
  peers: string[];
};

export const ChatAvatar = ({
  title,
  type,
  path,
  peers,
  image,
  canEdit = false,
  size = 28,
}: ChatAvatarProps) => {
  const { friends } = useServices();
  const [showEdit, setShowEdit] = useState(false);
  let avatarElement = null;
  if (image) {
    // TODO: add image support
  }
  if (type === 'dm' && isValidPatp(title)) {
    const {
      patp,
      avatar,
      color: sigilColor,
    } = title
      ? friends.getContactAvatarMetadata(title)
      : { patp: title!, color: '#000', avatar: '' };
    avatarElement = (
      <Avatar
        patp={patp}
        avatar={avatar}
        size={size}
        sigilColor={[sigilColor, '#ffffff']}
        simple
      />
    );
  } else if (type === 'group') {
    avatarElement = (
      <GroupSigil
        path={path!}
        size={size / 3.5 + size}
        patps={peers.filter((peer) => peer !== window.ship) as string[]}
      />
    );
  } else {
    // TODO space type
  }
  return (
    <ChatAvatarBox
      position="relative"
      onHoverStart={() => {
        canEdit && setShowEdit(true);
      }}
      onHoverEnd={() => canEdit && setShowEdit(false)}
    >
      {avatarElement}
      {canEdit && showEdit && (
        <EditWrapper
          initial={{ opacity: 0 }}
          animate={{ opacity: showEdit ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button.Base
            className="chat-info-edit-image"
            size={24}
            borderRadius={12}
            onClick={(evt) => {
              evt.stopPropagation();
              // onRemove([ship, '']);
            }}
          >
            <Icon name="Edit" size={16} />
          </Button.Base>
        </EditWrapper>
      )}
    </ChatAvatarBox>
  );
};

const ChatAvatarBox = styled(Box)`
  border-radius: 4px;
  position: relative;
  transition: var(--transition);
  &:hover {
    transition: var(--transition);
    background: var(--rlm-overlay-hover);
  }
`;

const EditWrapper = styled(motion.div)`
  position: absolute;
  z-index: 4;
  top: -8px;
  right: -8px;

  .chat-info-edit-image {
    justify-content: center;
    align-items: center;
    /* background-color: #333333;
    svg {
      fill: #fff;
    } */
    transition: var(--transition);
    &:hover {
      transition: var(--transition);
      filter: brightness(0.95);
    }
  }
`;
