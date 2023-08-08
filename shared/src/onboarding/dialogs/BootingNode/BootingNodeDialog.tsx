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
  booting: boolean;
  onNext: (values: FormikValues) => Promise<boolean>;
};

export const BootingNodeDialog = ({ booting, onNext }: Props) => {
  const initialValues: Partial<BootingNodeDialogFields> = {
    booted: false,
  };

  return (
    <OnboardDialog
      minimal
      initialValues={initialValues}
      validationSchema={CreateAccountSchema}
      body={
        <BootingNodeDialogBody
          booting={booting}
          credentials={{
            id: '~pasren-satmex',
            url: 'https://pasren-satmex.holium.network',
            accessCode: 'tolnym-rilmug-ricnep-marlyx',
          }}
        />
      }
      nextText="Go to account"
      hideNextButton={booting}
      onNext={() => onNext({})}
    />
  );
};
