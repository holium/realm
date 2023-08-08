import { FormikValues } from 'formik';
import * as Yup from 'yup';

import { OnboardDialog } from '../../components/OnboardDialog';
import { SkippedPaymentDialogBody } from './SkippedPaymentDialogBody';

type Props = {
  onNext: (values: FormikValues) => Promise<boolean>;
};

export const SkippedPaymentDialog = ({ onNext }: Props) => {
  return (
    <OnboardDialog
      minimal
      initialValues={{}}
      validationSchema={Yup.object()}
      body={<SkippedPaymentDialogBody dueDate="August 15th, 2023" />}
      onBack={() => {}}
      onNext={onNext}
    />
  );
};
