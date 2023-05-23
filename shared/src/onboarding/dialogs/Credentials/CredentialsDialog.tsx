import { OnboardDialog } from '../../components/OnboardDialog';
import { CredentialsIcon } from '../../icons/CredentialsIcon';
import { CredentialsDialogBody } from './CredentialsDialogBody';

type Props = {
  credentials: {
    id: string;
    url: string;
    accessCode: string;
  };
  onNext: () => Promise<boolean>;
};

export const CredentialsDialog = ({ credentials, onNext }: Props) => (
  <OnboardDialog
    icon={<CredentialsIcon />}
    body={<CredentialsDialogBody credentials={credentials} />}
    onNext={onNext}
  />
);
