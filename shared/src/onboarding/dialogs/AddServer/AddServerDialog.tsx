import { FormikValues } from 'formik';
import * as Yup from 'yup';

import { OnboardDialog } from '../../components/OnboardDialog';
import { CredentialsIcon } from '../../icons/CredentialsIcon';
import { AddServerDialogBody } from './AddServerDialogBody';

const AddServerSchema = Yup.object().shape({
  id: Yup.string().required('Required'),
  url: Yup.string().required('Required'),
  code: Yup.string().required('Required'),
});

type Props = {
  onBack: () => void;
  onNext: (id: string, url: string, code: string) => Promise<boolean>;
};

export const AddServerDialog = ({ onBack, onNext }: Props) => {
  const handleOnNext = async ({ id, url, code }: FormikValues) => {
    try {
      const urlWithNoTrailingSlash = url.endsWith('/') ? url.slice(0, -1) : url;

      return onNext(id, urlWithNoTrailingSlash, code);
    } catch (e) {
      return false;
    }
  };

  return (
    <OnboardDialog
      initialValues={{ id: undefined, url: undefined, code: undefined }}
      validationSchema={AddServerSchema}
      icon={<CredentialsIcon />}
      body={<AddServerDialogBody />}
      nextText="Add Ship"
      onBack={onBack}
      onNext={handleOnNext}
    />
  );
};
