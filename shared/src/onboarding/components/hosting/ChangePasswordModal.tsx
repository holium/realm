import { ChangeEvent, FormEvent, useRef, useState } from 'react';
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
  onSubmit: (password: string) => Promise<boolean>;
};

export const ChangePasswordModal = ({ isOpen, onDismiss, onSubmit }: Props) => {
  const submitting = useToggle(false);
  const confirmPasswordError = useToggle(false);

  const [errorMessage, setErrorMessage] = useState<string>();

  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmpasswordRef = useRef<HTMLInputElement>(null);

  const onConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const password = passwordRef.current?.value;
    const confirmPassword = e.target.value;
    confirmPasswordError.setToggle(password !== confirmPassword);
  };

  const handleSubmit = async (event: FormEvent) => {
    setErrorMessage(undefined);

    event.preventDefault();
    submitting.toggleOn();

    if (
      passwordRef.current &&
      confirmpasswordRef.current &&
      passwordRef.current.value === confirmpasswordRef.current.value
    ) {
      const response = await onSubmit(passwordRef.current.value);

      if (!response) {
        setErrorMessage('Something went wrong. Please try again.');
      }

      submitting.toggleOff();
    }
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} onSubmit={handleSubmit}>
      <Text.H5 padding="16px 0">Change password</Text.H5>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="email">
          New password
        </OnboardDialogInputLabel>
        <OnboardDialogInput
          ref={passwordRef}
          type="password"
          placeholder="• • • • • • • •"
        />
      </Flex>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="email">
          Confirm password
        </OnboardDialogInputLabel>
        <OnboardDialogInput
          ref={confirmpasswordRef}
          type="password"
          placeholder="• • • • • • • •"
          onChange={onConfirmPasswordChange}
          isError={confirmPasswordError.isOn}
        />
      </Flex>
      <Flex justifyContent="flex-end" paddingTop="8px">
        <SubmitButton text="Save" submitting={submitting.isOn} />
      </Flex>
      {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
    </Modal>
  );
};
