import * as Yup from 'yup';

import { OnboardDialog } from '../../components/OnboardDialog';
import { DownloadIcon } from '../../icons/DownloadIcon';
import { RealmInstallStatus } from '../../types/index';
import { InstallationDialogBody } from './InstallationDialogBody';

const InstallRealmSchema = Yup.object().shape({
  installed: Yup.boolean().oneOf([true]),
  installing: Yup.boolean().oneOf([false]),
});

type Props = {
  onInstallRealm: () => Promise<RealmInstallStatus>;
  onNext: () => Promise<boolean>;
};

export const InstallationDialog = ({ onInstallRealm, onNext }: Props) => (
  <OnboardDialog
    initialValues={{ installed: undefined, installing: false }}
    validationSchema={InstallRealmSchema}
    icon={<DownloadIcon />}
    body={<InstallationDialogBody onInstallRealm={onInstallRealm} />}
    onNext={onNext}
  />
);
