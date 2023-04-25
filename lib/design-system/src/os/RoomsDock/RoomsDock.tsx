import styled from 'styled-components';

import { ContactData } from '../../general/Avatar/AvatarRow';
import { Flex } from '../../general/Flex/Flex';

import { RoomsDockControls } from './RoomsDockControls';
import { RoomsDockDescription } from './RoomsDockDescription';

export const RoomsDockStyle = styled(Flex)`
  transition: var(--transition);
  height: 34px;
  width: 200px;
  flex-basis: 200px;
  align-items: center;
  justify-content: space-between;
  padding: 3px 3px 3px 5px;
  gap: 8px;
  cursor: pointer;
  border-radius: var(--rlm-border-radius-4);
  background-color: rgba(var(--rlm-overlay-hover-rgba));
  box-shadow: inset 0px 0px 1px rgba(0, 0, 0, 0.25);

  &:hover:not([disabled]) {
    transition: var(--transition);
    background-color: rgba(var(--rlm-overlay-hover-rgba));
  }
  &:active:not([disabled]):not(:focus-within) {
    transition: var(--transition);
    background-color: rgba(var(--rlm-overlay-active-rgba));
  }
`;

type RoomsDockProps = {
  live: any;
  participants: ContactData[];
  rooms?: any[];
  isMuted?: boolean;
  hasMicPermissions?: boolean;
  onCreate: (evt: React.MouseEvent<HTMLButtonElement>) => void;
  onOpen: (evt: React.MouseEvent<HTMLDivElement>) => void;
  onMute: (muted: boolean) => void;
  onCursor: (enabled: boolean) => void;
  onLeave: () => void;
  children?: React.ReactNode;
};

export const RoomsDock = ({
  live,
  rooms = [],
  isMuted,
  hasMicPermissions,
  onOpen,
  onMute,
  participants = [],
}: RoomsDockProps) => (
  <RoomsDockStyle id="rooms-tray-icon" onClick={onOpen}>
    <RoomsDockDescription
      live={live}
      rooms={rooms}
      participants={participants}
    />
    <RoomsDockControls
      live={live}
      isMuted={Boolean(isMuted)}
      hasMicPermissions={Boolean(hasMicPermissions)}
      onMute={onMute}
    />
  </RoomsDockStyle>
);
