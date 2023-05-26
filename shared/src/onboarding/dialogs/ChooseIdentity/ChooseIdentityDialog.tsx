import { FormikValues } from 'formik';
import * as Yup from 'yup';

import { OnboardDialog } from '../../components/OnboardDialog';
import { IdentityIcon } from '../../icons/IdentityIcon';
import { ChooseIdentityDialogBody } from './ChooseIdentityDialogBody';

const ChooseIdSchema = Yup.object().shape({
  id: Yup.string().required('Required'),
});

type Props = {
  identities: string[];
  onBack?: () => void;
  onNext: (values: FormikValues) => Promise<boolean>;
};

export const ChooseIdentityDialog = ({ identities, onBack, onNext }: Props) => (
  <OnboardDialog
    initialValues={{ id: undefined }}
    validationSchema={ChooseIdSchema}
    icon={<IdentityIcon />}
    body={<ChooseIdentityDialogBody identities={identities} />}
    onBack={onBack}
    onNext={onNext}
  />
);
