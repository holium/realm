import { FormikValues } from 'formik';
import * as Yup from 'yup';

import { OnboardDialog } from '../../components/OnboardDialog';
import {
  BootingNodeDialogBody,
  BootingNodeDialogFields,
} from './BootingNodeDialogBody';

const CreateAccountSchema = Yup.object().shape({
  booted: Yup.boolean().required('Booted is required.'),
});

type Props = {
  onNext: (values: FormikValues) => Promise<boolean>;
};

export const BootingNodeDialog = ({ onNext }: Props) => {
  const initialValues: Partial<BootingNodeDialogFields> = {
    booted: false,
  };

  return (
    <OnboardDialog
      minimal
      initialValues={initialValues}
      validationSchema={CreateAccountSchema}
      body={<BootingNodeDialogBody />}
      onNext={onNext}
    />
  );
};
