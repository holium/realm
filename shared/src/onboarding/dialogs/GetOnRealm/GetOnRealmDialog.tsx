import { OnboardDialog } from '../../components/OnboardDialog';
import { GetIdIcon } from '../../icons/GetIdIcon';
import { GetRealmDialogBody } from './GetOnRealmDialogBody';

type Props = {
  onBack?: () => void;
  onUploadId: () => void;
  onPurchaseId: () => void;
};

export const GetOnRealmDialog = ({
  onBack,
  onUploadId,
  onPurchaseId,
}: Props) => (
  <OnboardDialog
    icon={<GetIdIcon size={200} />}
    body={
      <GetRealmDialogBody onUploadId={onUploadId} onPurchaseId={onPurchaseId} />
    }
    onBack={onBack}
    hideNextButton
  />
);
