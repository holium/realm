import { CSSProperties, FormEvent, useRef, useState } from 'react';

import { ErrorBox, Flex, Text } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

import { Modal } from '../../Modal';
import { OnboardDialogInputLabel } from '../../OnboardDialog.styles';
import { SubmitButton } from '../SubmitButton';

type Props = {
  isOpen: boolean;
  style?: CSSProperties;
  onDismiss: () => void;
  onSubmit: (email: string) => Promise<boolean>;
};

export const ForgotPasswordModal = ({
  isOpen,
  style,
  onDismiss,
  onSubmit,
}: Props) => {
  const submitting = useToggle(false);

  const [errorMessage, setErrorMessage] = useState<string>();

  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent) => {
    setErrorMessage(undefined);

    event.preventDefault();
    submitting.toggleOn();

    if (emailRef.current) {
      const response = await onSubmit(emailRef.current.value);

      if (!response) {
        setErrorMessage('Something went wrong. Please try again.');
      }

      submitting.toggleOff();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      style={style}
      onDismiss={onDismiss}
      onSubmit={handleSubmit}
    >
      <Text.H5 padding="16px 0">Forgot password</Text.H5>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="new-password">
          Email
        </OnboardDialogInputLabel>
        <TextInput
          height="38px"
          id="email"
          name="email"
          type="email"
          ref={emailRef}
          placeholder="email@address.com"
        />
      </Flex>
      <Flex justifyContent="flex-end" paddingTop="8px">
        <SubmitButton text="Send token" submitting={submitting.isOn} />
      </Flex>
      {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
    </Modal>
  );
};
