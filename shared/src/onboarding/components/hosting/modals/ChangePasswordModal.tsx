import { ChangeEvent, CSSProperties, FormEvent, useRef, useState } from 'react';

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
  onSubmit: (password: string) => Promise<boolean>;
};

export const ChangePasswordModal = ({
  isOpen,
  style,
  onDismiss,
  onSubmit,
}: Props) => {
  const submitting = useToggle(false);
  const confirmPasswordError = useToggle(false);

  const [errorMessage, setErrorMessage] = useState<string>();

  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmpasswordRef = useRef<HTMLInputElement>(null);

  const onChangePassword = () => {
    confirmPasswordError.toggleOff();
  };

  const onChangeConfirmPassword = (e: ChangeEvent<HTMLInputElement>) => {
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
    <Modal
      isOpen={isOpen}
      style={style}
      onDismiss={onDismiss}
      onSubmit={handleSubmit}
    >
      <Text.H5 padding="16px 0">Change password</Text.H5>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="new-password">
          New password
        </OnboardDialogInputLabel>
        <TextInput
          height="38px"
          id="new-password"
          name="new-password"
          ref={passwordRef}
          type="password"
          placeholder="• • • • • • • •"
          onChange={onChangePassword}
        />
      </Flex>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="confirm-password">
          Confirm Password
        </OnboardDialogInputLabel>
        <TextInput
          height="38px"
          id="confirm-password"
          name="confirm-password"
          ref={confirmpasswordRef}
          type="password"
          placeholder="• • • • • • • •"
          onChange={onChangeConfirmPassword}
          error={confirmPasswordError.isOn}
        />
      </Flex>
      <Flex justifyContent="flex-end" paddingTop="8px">
        <SubmitButton text="Save" submitting={submitting.isOn} />
      </Flex>
      {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
    </Modal>
  );
};
