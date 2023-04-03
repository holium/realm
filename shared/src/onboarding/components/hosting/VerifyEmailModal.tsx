import { useRef, useState } from 'react';
import { Text, Flex, useToggle, ErrorBox } from '@holium/design-system';
import { Modal } from '../Modal';
import {
  OnboardDialogInputLabel,
  OnboardDialogInput,
} from '../OnboardDialog.styles';
import { SubmitButton } from './SubmitButton';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (token: string, password: string) => Promise<boolean>;
};

export const VerifyEmailModal = ({ isOpen, onDismiss, onSubmit }: Props) => {
  const submitting = useToggle(false);

  const [errorMessage, setErrorMessage] = useState<string>();

  const tokenRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    setErrorMessage(undefined);

    event.preventDefault();
    submitting.toggleOn();

    if (tokenRef.current && passwordRef.current) {
      const response = await onSubmit(
        tokenRef.current.value,
        passwordRef.current.value
      );

      if (!response) {
        setErrorMessage('Something went wrong. Please try again.');
      }

      submitting.toggleOff();
    }
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} onSubmit={handleSubmit}>
      <Text.H5 padding="16px 0">Verify new email</Text.H5>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="text">
          Authorization token
        </OnboardDialogInputLabel>
        <OnboardDialogInput
          ref={tokenRef}
          type="text"
          placeholder="abc...xyz"
        />
      </Flex>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="password">
          Password
        </OnboardDialogInputLabel>
        <OnboardDialogInput
          ref={passwordRef}
          type="password"
          placeholder="• • • • • • • •"
        />
      </Flex>
      <Flex justifyContent="flex-end" paddingTop="8px">
        <SubmitButton text="Verify" submitting={submitting.isOn} />
      </Flex>
      {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
    </Modal>
  );
};
