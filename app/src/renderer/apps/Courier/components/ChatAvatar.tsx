import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { Avatar, Box, BoxProps, Button, Icon } from '@holium/design-system';

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
  onUpload?: (evt: any) => void;
};

export const ChatAvatar = ({
  title,
  type,
  path,
  peers,
  image,
  onUpload,
  canEdit = false,
  size = 28,
}: ChatAvatarProps) => {
  const { friends } = useServices();
  const [showEdit, setShowEdit] = useState(false);
  let avatarElement = null;

  if (type === 'dm') {
    // 1-1 chat
    const patp = peers.map((p) => p).find((p) => p !== window.ship);
    if (!patp) return null;

    const { avatar, color: sigilColor } = title
      ? friends.getContactAvatarMetadata(patp)
      : { color: '#000', avatar: '' };
    avatarElement = (
      <Avatar
        patp={patp}
        avatar={avatar}
        size={size}
        sigilColor={[sigilColor, '#ffffff']}
        simple
      />
    );
  }
  if (!image && type === 'group') {
    avatarElement = (
      <GroupSigil
        path={path}
        size={size / 3.5 + size}
        patps={peers.filter((peer) => peer !== window.ship) as string[]}
      />
    );
  }
  if (!image && type === 'space') {
    // todo: add space sigil
  }
  if (image) {
    avatarElement = (
      <ImageCrest height={size} width={size} borderRadius={4} src={image} />
    );
  }

  return (
    <ChatAvatarBox
      position="relative"
      canEdit={canEdit}
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
            onClick={onUpload}
          >
            <Icon name="Edit" size={16} />
          </Button.Base>
        </EditWrapper>
      )}
    </ChatAvatarBox>
  );
};

type ChatAvatarBoxProps = {
  canEdit: boolean;
} & BoxProps;

const ChatAvatarBox = styled(Box)<ChatAvatarBoxProps>`
  border-radius: 4px;
  position: relative;
  transition: var(--transition);
  ${(props) =>
    props.canEdit &&
    css`
      &:hover {
        transition: var(--transition);
        background: var(--rlm-overlay-hover);
      }
    `}
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

interface CrestStyleProps {
  height: number;
  width: number;
  src: string;
  borderRadius: number;
}

export const ImageCrest = styled(motion.div)<CrestStyleProps>`
  border-radius: ${(p) => p.borderRadius}px;
  background-image: url(${(props) => props.src});
  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;
