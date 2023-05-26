import { OnboardDialog } from '../../components/OnboardDialog';
import { GetRealmDialogBody } from './GetRealmDialogBody';

type Props = {
  onBack: () => void;
  onGetANewId: () => void;
};

export const GetRealmDialog = ({ onBack, onGetANewId }: Props) => (
  <OnboardDialog
    body={<GetRealmDialogBody onGetANewId={onGetANewId} />}
    hideNextButton
    onBack={onBack}
  />
);
