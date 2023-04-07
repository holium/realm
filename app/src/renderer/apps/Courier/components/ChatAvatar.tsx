import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { Avatar, Box, BoxProps, Button, Icon } from '@holium/design-system';

import { GroupSigil } from '../components/GroupSigil';
import { useState } from 'react';
import { Crest } from 'renderer/components';

type ChatAvatarProps = {
  sigil?: {
    patp: string;
    color: [string, string];
    nickname?: string;
  };
  type: string;
  path: string;
  image?: string;
  color?: string;
  canEdit?: boolean;
  metadata?: any;
  size?: number;
  peers: string[];
  onUpload?: (evt: any) => void;
};

export const ChatAvatar = ({
  sigil,
  type,
  path,
  peers,
  color,
  image,
  onUpload,
  canEdit = false,
  size = 28,
}: ChatAvatarProps) => {
  const [showEdit, setShowEdit] = useState(false);
  let avatarElement = null;

  if (type === 'dm') {
    if (!sigil) return null;
    avatarElement = (
      <Avatar
        simple
        patp={sigil.patp}
        avatar={image}
        size={size}
        sigilColor={sigil.color}
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
  if (type === 'space' && !image && color) {
    avatarElement = (
      <motion.div
        style={{
          borderRadius: 4,
          backgroundColor: color,
          width: size,
          height: size,
        }}
      />
    );
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
        background: rgba(var(--rlm-overlay-hover-rgba));
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
