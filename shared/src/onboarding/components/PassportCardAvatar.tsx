import styled from 'styled-components';
import { Flex, Avatar, Button } from '@holium/design-system/general';
import { AddImageIcon } from '../icons/AddImageIcon';
import { useToggle } from '@holium/design-system/util';
import { MOBILE_WIDTH } from './OnboardDialog.styles';
import { useEffect, useRef } from 'react';

const PassportAvatarModal = styled(Flex)`
  position: absolute;
  top: 0;
  left: 80px;
  width: 300px;
  height: 260px;
  padding: 12px;
  border-radius: 9px;
  border: 1px solid rgba(var(--rlm-border-rgba));
  box-shadow: var(--rlm-box-shadow-3);
  background-color: rgba(var(--rlm-window-rgba));
  z-index: 1;

  @media screen and (max-width: ${MOBILE_WIDTH}px) {
    left: 0;
  }
`;

const AddImageButton = styled(Button.IconButton)`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(var(--rlm-input-rgba));

  &:hover:not(:disabled) {
    filter: brightness(0.9);
    background: rgba(var(--rlm-input-rgba));
  }
`;
type Props = {
  patp: string;
  onSetAvatar: () => void;
};

export const PassportCardAvatar = ({ patp, onSetAvatar }: Props) => {
  const avatarModal = useToggle(true);

  const modalButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalButtonRef.current &&
        modalRef.current &&
        !modalButtonRef.current.contains(event.target as Node) &&
        !modalRef.current.contains(event.target as Node)
      ) {
        avatarModal.toggleOff();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef, avatarModal]);

  return (
    <Flex position="relative" width={68}>
      {avatarModal.isOn && (
        <PassportAvatarModal ref={modalRef}>
          <Avatar patp={patp} sigilColor={['black', 'white']} size={50} />
        </PassportAvatarModal>
      )}
      <AddImageButton
        type="button"
        ref={modalButtonRef}
        onClick={avatarModal.toggleOn}
      >
        <AddImageIcon />
      </AddImageButton>
      <Avatar patp={patp} sigilColor={['black', 'white']} size={68} />
    </Flex>
  );
};
