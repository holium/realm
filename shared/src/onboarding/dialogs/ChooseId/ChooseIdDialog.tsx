import { FormikValues } from 'formik';
import * as Yup from 'yup';

import { OnboardDialog } from '../../components/OnboardDialog';
import { IdentityIcon } from '../../icons/IdentityIcon';
import { ChooseIdDialogBody } from './ChooseIdDialogBody';

const ChooseIdSchema = Yup.object().shape({
  id: Yup.string().required('Required'),
});

type Props = {
  ids: string[];
  onBack?: () => void;
  onNext: (values: FormikValues) => Promise<boolean>;
};

export const ChooseIdDialog = ({ ids, onBack, onNext }: Props) => (
  <OnboardDialog
    initialValues={{ id: undefined }}
    validationSchema={ChooseIdSchema}
    icon={<IdentityIcon />}
    body={<ChooseIdDialogBody ids={ids} />}
    onBack={onBack}
    onNext={onNext}
  />
);
