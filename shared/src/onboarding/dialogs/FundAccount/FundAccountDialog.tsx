import { FormikValues } from 'formik';
import * as Yup from 'yup';

import { OnboardDialog } from '../../components/OnboardDialog';
import {
  FundAccountDialogBody,
  FundAccountDialogFields,
} from './FundAccountDialogBody';

const CreateAccountSchema = Yup.object().shape({
  fundingOption: Yup.number().required('Funding option is required.'),
});

type Props = {
  onNext: (values: FormikValues) => Promise<boolean>;
};

export const FundAccountDialog = ({ onNext }: Props) => {
  const initialValues: Partial<FundAccountDialogFields> = {
    fundingOption: 0,
  };

  return (
    <OnboardDialog
      minimal
      initialValues={initialValues}
      validationSchema={CreateAccountSchema}
      body={
        <FundAccountDialogBody
          ethAddress="0xAC36fc83EB0B09ACd3244AD6637A8e8404724D6c"
          onNext={() => onNext({})}
        />
      }
      hideNextButton
    />
  );
};
