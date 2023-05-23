import { ReactNode } from 'react';
import { useFormikContext } from 'formik';

import { Button, Flex, Icon } from '@holium/design-system/general';
import { useToggle } from '@holium/design-system/util';

import { OnboardDialogInputLabel } from '../../components/OnboardDialog.styles';
import { FormField } from '../../onboarding';

type LoginFields = {
  email: string;
  password: string;
};

type Props = {
  label?: ReactNode;
};

export const LoginDialogBody = ({ label }: Props) => {
  const { errors } = useFormikContext<LoginFields>();

  const showPassword = useToggle(false);

  return (
    <>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="login-email">
          Email
        </OnboardDialogInputLabel>
        <FormField
          name="email"
          type="email"
          placeholder="name@email.com"
          isError={Boolean(errors.email)}
        />
      </Flex>
      <Flex flexDirection="column" gap={2}>
        <OnboardDialogInputLabel as="label" htmlFor="login-password">
          Password
        </OnboardDialogInputLabel>
        <FormField
          name="password"
          type={showPassword.isOn ? 'text' : 'password'}
          placeholder="• • • • • • • •"
          isError={Boolean(errors.password)}
          rightIcon={
            <Button.IconButton type="button" onClick={showPassword.toggle}>
              <Icon
                name={showPassword.isOn ? 'EyeOff' : 'EyeOn'}
                opacity={0.5}
                size={18}
              />
            </Button.IconButton>
          }
        />
      </Flex>
      {label}
    </>
  );
};
