import { OnboardDialog } from '../../components/OnboardDialog';
import { GetRealmDialogBody } from './GetRealmDialogBody';

type Props = {
  onBack: () => void;
  onPurchaseId: () => void;
  onUploadId: () => void;
};

export const GetRealmDialog = ({ onBack, onPurchaseId, onUploadId }: Props) => (
  <OnboardDialog
    body={
      <GetRealmDialogBody onPurchaseId={onPurchaseId} onUploadId={onUploadId} />
    }
    hideNextButton
    onBack={onBack}
  />
);
