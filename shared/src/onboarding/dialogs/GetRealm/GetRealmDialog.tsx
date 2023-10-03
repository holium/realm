import { OnboardDialog } from '../../components/OnboardDialog';
import { GetRealmDialogBody } from './GetRealmDialogBody';

type Props = {
  onBack: () => void;
  onPurchaseId: () => void;
  onUploadPier: () => void;
};

export const GetRealmDialog = ({
  onBack,
  onPurchaseId,
  onUploadPier,
}: Props) => (
  <OnboardDialog
    body={
      <GetRealmDialogBody
        onPurchaseId={onPurchaseId}
        onUploadPier={onUploadPier}
      />
    }
    hideNextButton
    onBack={onBack}
  />
);
