import { ChangeEvent, useState } from 'react';

import { Flex } from '@holium/design-system/general';
import { TextInput } from '@holium/design-system/inputs';
import { useToggle } from '@holium/design-system/util';

import { OnboardDialog } from '../../components/OnboardDialog';
import {
  OnboardDialogDescription,
  OnboardDialogInputLabel,
  OnboardDialogTitle,
} from '../../components/OnboardDialog.styles';
import { PasswordIcon } from '../../icons/PasswordIcon';

type Props = {
  onBack: () => void;
  onNext: (password: string) => Promise<boolean>;
};

export const PasswordDialog = ({ onBack, onNext }: Props) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const confirmPasswordError = useToggle(false);

  const onChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const onChangeConfirmPassword = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    confirmPasswordError.toggleOff();
  };

  const onBlurConfirmPassword = () => {
    if (password !== confirmPassword) {
      confirmPasswordError.toggleOn();
    } else {
      confirmPasswordError.toggleOff();
    }
  };

  const handleOnLogin = () => {
    if (password && confirmPassword && password === confirmPassword)
      return onNext(password);
    return Promise.resolve(false);
  };

  return (
    <OnboardDialog
      icon={<PasswordIcon />}
      body={() => (
        <>
          <Flex flexDirection="column" gap={16} mb={12}>
            <OnboardDialogTitle>Password</OnboardDialogTitle>
            <OnboardDialogDescription>
              This password will encrypt your local data.
            </OnboardDialogDescription>
          </Flex>
          <Flex flexDirection="column" gap={2}>
            <OnboardDialogInputLabel as="label" htmlFor="login-password">
              Password
            </OnboardDialogInputLabel>
            <TextInput
              height="38px"
              id="local-password"
              name="local-password"
              type="password"
              placeholder="• • • • • • • •"
              onChange={onChangePassword}
            />
          </Flex>
          <Flex flexDirection="column" gap={2}>
            <OnboardDialogInputLabel as="label" htmlFor="login-password">
              Confirm Password
            </OnboardDialogInputLabel>
            <TextInput
              height="38px"
              id="local-confirm-password"
              name="local-confirm-password"
              type="password"
              placeholder="• • • • • • • •"
              error={confirmPasswordError.isOn}
              onChange={onChangeConfirmPassword}
              onBlur={onBlurConfirmPassword}
            />
          </Flex>
        </>
      )}
      onBack={onBack}
      onNext={handleOnLogin}
    />
  );
};
