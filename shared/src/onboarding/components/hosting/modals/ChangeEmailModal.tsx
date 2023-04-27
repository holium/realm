import { ChangeEvent, useRef, useState } from 'react';

import { ErrorBox, Flex, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

import { Modal } from '../../Modal';
import { OnboardDialogInputLabel } from '../../OnboardDialog.styles';
import { SubmitButton } from '../SubmitButton';

type Props = {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (email: string) => Promise<boolean>;
};

export const ChangeEmailModal = ({ isOpen, onDismiss, onSubmit }: Props) => {
  const submitting = useToggle(false);
  const confirmEmailError = useToggle(false);

  const [errorMessage, setErrorMessage] = useState<string>();

  const emailRef = useRef<HTMLInputElement>(null);
  const confirmEmailRef = useRef<HTMLInputElement>(null);

  const onConfirmEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const password = emailRef.current?.value;
    const confirmPassword = e.target.value;
    confirmEmailError.setToggle(password !== confirmPassword);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    setErrorMessage(undefined);

    event.preventDefault();
    submitting.toggleOn();

    if (emailRef.current && confirmEmailRef.current) {
      const response = await onSubmit(emailRef.current.value);

      if (!response) {
        setErrorMessage('Something went wrong. Please try again.');
      }

      submitting.toggleOff();
    }
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} onSubmit={handleSubmit}>
      <Text.H5 padding="16px 0">Change email</Text.H5>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="change-email">
          New email
        </OnboardDialogInputLabel>
        <TextInput
          height="38px"
          id="change-email"
          name="change-email"
          ref={emailRef}
          type="email"
          placeholder="name@email.com"
        />
      </Flex>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="confirm-email">
          Confirm email
        </OnboardDialogInputLabel>
        <TextInput
          height="38px"
          id="confirm-email"
          name="confirm-email"
          type="email"
          ref={confirmEmailRef}
          placeholder="name@email.com"
          error={confirmEmailError.isOn}
          onChange={onConfirmEmailChange}
        />
      </Flex>
      <Flex justifyContent="flex-end" paddingTop="8px">
        <SubmitButton text="Save" submitting={submitting.isOn} />
      </Flex>
      {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
    </Modal>
  );
};
