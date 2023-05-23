import { ReactNode } from 'react';
import { FormikValues } from 'formik';
import * as yup from 'yup';

import { HoliumButton } from '@holium/design-system/os';
import { useToggle } from '@holium/design-system/util';

import { OnboardDialog } from '../../components/OnboardDialog';
import { TermsModal } from '../../components/TermsModal';
import { LoginDialogBody } from './LoginDialogBody';

const LoginSchema = yup.object().shape({
  email: yup.string().required('Email is required.').email('Invalid email.'),
  password: yup.string().required('Password is required.'),
});

type Props = {
  prefilledEmail?: string;
  // Terms are only necessary in Realm, not on the web.
  footer?: ReactNode;
  label?: ReactNode;
  onBack?: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
};

export const LoginDialog = ({
  prefilledEmail = '',
  footer,
  label,
  onBack,
  onLogin,
}: Props) => {
  const terms = useToggle(false);

  const handleOnLogin = ({ email, password }: FormikValues) => {
    return onLogin(email, password);
  };

  return (
    <>
      <OnboardDialog
        initialValues={{
          email: prefilledEmail,
          password: undefined,
        }}
        validationSchema={LoginSchema}
        icon={<HoliumButton size={100} pointer={false} />}
        body={<LoginDialogBody label={label} />}
        footer={footer}
        nextText="Login"
        onBack={onBack}
        onNext={handleOnLogin}
      />
      <TermsModal
        isOpen={terms.isOn}
        onDismiss={terms.toggleOff}
        onAccept={terms.toggleOff}
      />
    </>
  );
};
