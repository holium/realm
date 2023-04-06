import { FormEvent, ReactNode } from 'react';
import styled from 'styled-components';
import { Button, Icon } from '@holium/design-system';
import { MOBILE_WIDTH } from './OnboardDialog.styles';

const ModalContainer = styled.div`
  display: flex;
  position: absolute;
  z-index: 100;
  width: 100%;
  max-width: ${MOBILE_WIDTH}px;
  padding: 32px;
  border-radius: 11px;
  background-color: rgba(var(--rlm-window-rgba));
  box-shadow: var(--rlm-box-shadow-3);

  @media (max-width: ${MOBILE_WIDTH}px) {
    height: 100%;
    align-items: center;
    border-radius: 0;
  }
`;

const Overlay = styled.div`
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
`;

const Form = styled.form`
  display: relative;
  width: 100%;
  display: flex;
  gap: 16px;
  flex-direction: column;
`;

const CloseFormContainer = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
`;

type Props = {
  isOpen: boolean;
  children: ReactNode;
  onDismiss: () => void;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
};

export const Modal = ({ isOpen, children, onDismiss, onSubmit }: Props) => {
  if (!isOpen) return null;

  return (
    <>
      <Overlay onClick={onDismiss} />
      <ModalContainer>
        <Form onSubmit={onSubmit}>
          <CloseFormContainer>
            <Button.Transparent onClick={onDismiss}>
              <Icon name="Close" size={20} fill="text" opacity={0.5} />
            </Button.Transparent>
          </CloseFormContainer>
          {children}
        </Form>
      </ModalContainer>
    </>
  );
};
